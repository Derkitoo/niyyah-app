// Petites icônes SVG (trait), cohérentes avec l'esthétique Niyyah.
interface P { size?: number; }
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IconHome = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></svg>
);
export const IconPray = ({ size = 24 }: P) => (
  // mosquée stylisée
  <svg {...base(size)} className="ni"><path d="M12 3c2.5 2 4 3.4 4 5.5 0 1.5-1.8 2.5-4 2.5S8 10 8 8.5C8 6.4 9.5 5 12 3Z" /><path d="M4 21v-7a3 3 0 0 1 3-3" /><path d="M20 21v-7a3 3 0 0 0-3-3" /><path d="M4 21h16" /><path d="M12 11v10" /></svg>
);
export const IconBook = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><path d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2Z" /><path d="M20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2Z" /></svg>
);
export const IconCheck = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><path d="M4 12h2.5L8 9l2 6 2-9 2 7 1.5-3H20" /></svg>
);
export const IconMoon = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></svg>
);
export const IconGrid = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>
);
export const IconHand = ({ size = 24 }: P) => (
  // mains levées (du'a)
  <svg {...base(size)} className="ni"><path d="M8 21v-6l-2-2a1.5 1.5 0 0 1 2-2l2 2V6a1.5 1.5 0 0 1 3 0v3a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6Z" /></svg>
);
export const IconMirror = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><rect x="6" y="3" width="12" height="15" rx="6" /><path d="M12 18v3" /><path d="M9 21h6" /></svg>
);
export const IconStarList = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><rect x="3.5" y="4" width="9" height="9" rx="1" transform="rotate(0 8 8.5)" /><path d="M8 5.5l1.2 2.4 2.6.3-1.9 1.8.5 2.6L8 13.1l-2.4 1.4.5-2.6-1.9-1.8 2.6-.3z" /><path d="M15 7h5M15 12h5M15 17h5" /></svg>
);
export const IconSettings = ({ size = 24 }: P) => (
  <svg {...base(size)} className="ni"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
);
export const IconChevron = ({ size = 24 }: P) => (
  <svg {...base(size)}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconTrash = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
);
export const IconPlus = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconFast = ({ size = 24 }: P) => (
  // assiette + barre = abstention (jeûne)
  <svg {...base(size)} className="ni"><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></svg>
);
export const IconBell = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);

/** Étoile géométrique à 8 branches (rub el hizb) — ornement. */
export const Ornament = ({ size = 130 }: P) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="#d9c39a" strokeWidth={1.2}>
    <rect x="22" y="22" width="56" height="56" />
    <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
    <circle cx="50" cy="50" r="40" />
  </svg>
);
