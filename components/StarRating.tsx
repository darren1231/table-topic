'use client';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: string;
}

export default function StarRating({ value, onChange, readOnly, size = '1.4rem' }: StarRatingProps) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="star"
          style={{
            fontSize: size,
            color: n <= value ? '#c9943a' : '#ddd',
            cursor: readOnly ? 'default' : 'pointer',
          }}
          onClick={() => !readOnly && onChange?.(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
