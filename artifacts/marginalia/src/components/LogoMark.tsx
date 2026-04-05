export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 86" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4,4 L4,82 L60,82 L60,28 L36,4 Z" fill="#BDAB9C" opacity="0.9"/>
      <line x1="13" y1="4" x2="13" y2="82" stroke="rgba(250,248,243,0.3)" strokeWidth="0.8"/>
      <line x1="17" y1="38" x2="52" y2="38" stroke="rgba(250,248,243,0.35)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="17" y1="50" x2="48" y2="50" stroke="rgba(250,248,243,0.28)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="17" y1="62" x2="40" y2="62" stroke="rgba(250,248,243,0.18)" strokeWidth="1" strokeLinecap="round"/>
      <path d="M36,4 L60,28 L36,28 Z" fill="#FAF8F3" opacity="0.55"/>
      <circle cx="13" cy="70" r="5" fill="#697962" opacity="0.85"/>
    </svg>
  );
}