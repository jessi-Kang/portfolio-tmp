import { useState } from 'react'
import SectionWrapper from './ui/SectionWrapper'
import { loadContactConfig } from '../utils/crypto'

export default function Contact() {
  const [config] = useState(loadContactConfig)

  return (
    <SectionWrapper id="contact" className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">{config.heading}</h2>
      <p className="text-gray-400 mb-8">
        {config.message}
      </p>
      <div className="flex items-center justify-center gap-4">
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            aria-label={`이메일 보내기 (${config.email})`}
            title={config.email}
            className="w-12 h-12 flex items-center justify-center border border-gray-700 hover:border-accent rounded-full text-gray-300 hover:text-accent hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </a>
        )}
        {config.linkedinUrl && (
          <a
            href={config.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={config.linkedinLabel || 'LinkedIn'}
            title={config.linkedinLabel || 'LinkedIn'}
            className="w-12 h-12 flex items-center justify-center border border-gray-700 hover:border-accent rounded-full text-gray-300 hover:text-accent hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z" />
            </svg>
          </a>
        )}
      </div>
      <p className="mt-16 text-gray-600 text-sm">
        {config.copyright}
      </p>
    </SectionWrapper>
  )
}
