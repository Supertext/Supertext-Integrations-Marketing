export const Chevron = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
);
export const Check = () => (
  <svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" fill="#78ffaf33" stroke="#288d89" strokeWidth="1" /><path d="m5.5 9.2 2.3 2.3 4.7-4.9" fill="none" stroke="#003230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Cross = () => (
  <svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" fill="none" stroke="#dfe1df" /><path d="m6.5 6.5 5 5m0-5-5 5" stroke="#7d8180" strokeWidth="1.3" strokeLinecap="round" /></svg>
);
export const MenuIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
  </svg>
);
