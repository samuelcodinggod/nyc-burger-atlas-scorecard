export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-label="NYC Burger Atlas"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 18.5C6 14.4 10.5 11 16 11C21.5 11 26 14.4 26 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M6.5 21H25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9 24.5C10 23 12 23 13 24.5C14 26 16 26 17 24.5C18 23 20 23 21 24.5C22 26 24 26 25 24.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="15.5" r="0.9" fill="currentColor" />
      <circle cx="16" cy="14.5" r="0.9" fill="currentColor" />
      <circle cx="20.5" cy="15.5" r="0.9" fill="currentColor" />
    </svg>
  );
}
