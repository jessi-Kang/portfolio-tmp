// Vercel serverless function: verifies a visitor access token SERVER-SIDE
// and mints a Firebase custom auth token with a {visitor: true} claim.
// Dependency-free: JWT signing via node:crypto, Firestore via REST.
import { createSign, createHash } from 'node:crypto'

function b64url(input) {
  return Buffer.from(input).toString('base64url')
}

function signJwt(payload, privateKey) {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${body}`)
  return `${header}.${body}.${signer.sign(privateKey).toString('base64url')}`
}

// OAuth2 access token for Firestore REST (cached across warm invocations)
let cachedAccess = { token: null, exp: 0 }

async function getAccessToken(sa) {
  if (cachedAccess.token && Date.now() < cachedAccess.exp - 60_000) return cachedAccess.token
  const now = Math.floor(Date.now() / 1000)
  const assertion = signJwt(
    {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    sa.private_key,
  )
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${assertion}`,
  })
  const d = await r.json()
  if (!d.access_token) throw new Error('oauth: ' + JSON.stringify(d))
  cachedAccess = { token: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 }
  return d.access_token
}

async function fetchTokens(sa) {
  const access = await getAccessToken(sa)
  const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/site/tokens`
  const r = await fetch(url, { headers: { Authorization: `Bearer ${access}` } })
  if (r.status === 404) return []
  if (!r.ok) throw new Error('firestore: HTTP ' + r.status)
  const d = await r.json()
  const values = d.fields?.items?.arrayValue?.values || []
  return values.map((v) => {
    const f = v.mapValue?.fields || {}
    return {
      id: f.id?.stringValue,
      label: f.label?.stringValue,
      token: f.token?.stringValue,
      tokenHash: f.tokenHash?.stringValue,
      expiresAt: Number(f.expiresAt?.integerValue ?? f.expiresAt?.doubleValue ?? 0),
      forceExpired: !!f.forceExpired?.booleanValue,
      revoked: !!f.revoked?.booleanValue,
      theme: f.theme?.stringValue || '',
    }
  })
}

// Firebase custom auth token (the client exchanges it via signInWithCustomToken)
function mintCustomToken(sa, uid, claims) {
  const now = Math.floor(Date.now() / 1000)
  return signJwt(
    {
      iss: sa.client_email,
      sub: sa.client_email,
      aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
      iat: now,
      exp: now + 3600,
      uid,
      claims,
    },
    sa.private_key,
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' })
    return
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Not configured yet — client falls back to legacy verification
    res.status(501).json({ error: 'not-configured' })
    return
  }
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    const token = String(req.body?.token || '').trim()
    if (!token) {
      res.status(400).json({ error: 'missing-token' })
      return
    }
    const items = await fetchTokens(sa)
    const hash = createHash('sha256').update(token).digest('hex')
    const now = Date.now()
    const match = items.find(
      (t) =>
        !t.revoked &&
        (t.tokenHash ? t.tokenHash === hash : t.token === token) && // legacy plaintext tokens still verify
        t.expiresAt > now &&
        !t.forceExpired,
    )
    if (!match) {
      res.status(401).json({ error: 'invalid-token' })
      return
    }
    res.status(200).json({
      customToken: mintCustomToken(sa, `visitor-${match.id}`, { visitor: true, tokenId: match.id }),
      id: match.id,
      label: match.label,
      expiresAt: match.expiresAt,
      theme: match.theme || '',
    })
  } catch (e) {
    res.status(500).json({ error: 'server-error', message: String(e?.message || e) })
  }
}
