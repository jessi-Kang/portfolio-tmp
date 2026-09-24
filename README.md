# Token-Gated Portfolio

접속 토큰으로 보호되는 개인 포트폴리오 시스템. React + Vite + Tailwind v4 + Firestore + Vercel.

- 🔐 방문자별 접속 토큰 (해시 저장, 만료·연장·폐기, 서버측 검증)
- 🛠 어드민 콘솔: 콘텐츠 편집, 토큰 발급, 접속 분석, 변경 이력, PDF 출력
- 🎨 토큰별 비주얼 테마 6종 + 어드민 실시간 미리보기
- 📊 게이트 방문·섹션 도달·클릭 추적, 보안 알림

## 시작하기

이 저장소 우측 상단의 **Use this template** (또는 Fork) 버튼으로 내 저장소를 만든 뒤:

```bash
git clone <내 저장소 주소> && cd <저장소>
npm install
cp .env.example .env   # 값 채우기
npm run dev            # 샘플 콘텐츠로 바로 화면 확인 가능
```

AI 코딩 도구를 쓴다면 TEMPLATE.md의 "프롬프트 1"을 붙여넣으면 개인화 작업을 통째로 맡길 수 있습니다.

이 저장소를 내 포트폴리오로 만드는 전체 절차(파이어베이스 설정, 개인값 교체 체크리스트, 운영·테마 가이드)는 **[TEMPLATE.md](TEMPLATE.md)** 를 참고하세요.
