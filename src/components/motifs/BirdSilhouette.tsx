type Props = {
  className?: string;
  color?: string;
};

/** A merpati/garuda-inspired wing silhouette used for markers and the logo mark. */
export function BirdSilhouette({ className, color = "currentColor" }: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 10
           C36 4 46 2 54 6
           C48 10 44 14 42 20
           C50 20 58 26 60 34
           C52 32 46 32 40 34
           C46 40 48 48 44 56
           C40 48 36 42 32 40
           C28 42 24 48 20 56
           C16 48 18 40 24 34
           C18 32 12 32 4 34
           C6 26 14 20 22 20
           C20 14 16 10 10 6
           C18 2 28 4 32 10 Z"
        fill={color}
      />
    </svg>
  );
}
