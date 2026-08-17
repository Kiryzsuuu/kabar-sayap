type GununganProps = {
  className?: string;
  strokeColor?: string;
};

/**
 * Simplified silhouette of a wayang kayon / gunungan — the leaf-shaped
 * screen used to open/close wayang kulit performances. Used as a decorative
 * divider and background motif throughout Kabar Sayap.
 */
export function Gunungan({ className, strokeColor = "currentColor" }: GununganProps) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M100 8
           C130 40 118 58 148 66
           C176 74 182 104 164 122
           C190 128 196 158 176 176
           C196 188 198 218 172 232
           C182 246 176 266 156 270
           C146 273 60 273 44 270
           C24 266 18 246 28 232
           C2 218 4 188 24 176
           C4 158 10 128 36 122
           C18 104 24 74 52 66
           C82 58 70 40 100 8 Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M100 30 C90 52 92 66 78 74"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M100 30 C110 52 108 66 122 74"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="150" r="18" stroke={strokeColor} strokeWidth="1.5" />
      <path
        d="M70 150 Q100 130 130 150 Q100 170 70 150 Z"
        stroke={strokeColor}
        strokeWidth="1.2"
      />
    </svg>
  );
}
