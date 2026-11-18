// Read-only when onChange is not given, clickable when it is
export default function StarRating({ value = 0, onChange, size = 18 }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <span className={filled ? 'star filled' : 'star'} key={n}>
            ★
          </span>
        );
        return onChange ? (
          <button type="button" key={n} className="star-btn" onClick={() => onChange(n)} aria-label={`${n} stars`}>
            {star}
          </button>
        ) : (
          star
        );
      })}
    </span>
  );
}
