import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';

export default function ReviewSection({ destinationId, onChanged }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api(`/destinations/${destinationId}/reviews`)
      .then((d) => setReviews(d.data))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [destinationId]);

  // Pre-fill the form with the user's existing review, if any
  useEffect(() => {
    const mine = reviews.find((r) => r.user?._id === user?.id);
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment);
    }
  }, [reviews, user]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api(`/destinations/${destinationId}/reviews`, { method: 'POST', body: { rating, comment } });
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api(`/destinations/${destinationId}/reviews/${id}`, { method: 'DELETE' });
      setComment('');
      setRating(5);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>Traveller reviews</h2>

      {user ? (
        <form onSubmit={submit} className="review-form">
          <label>Your rating</label>
          <StarRating value={rating} onChange={setRating} size={26} />
          <textarea
            rows="3"
            maxLength="1000"
            placeholder="Share tips or what you loved..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Post review'}
          </button>
        </form>
      ) : (
        <p className="muted">
          <Link to="/login">Log in</Link> to leave a review.
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <ul className="reviews">
        {reviews.length === 0 && <li className="muted">No reviews yet. Be the first!</li>}
        {reviews.map((r) => (
          <li key={r._id}>
            <div className="review-head">
              <strong>{r.user?.name || 'Traveller'}</strong>
              <StarRating value={r.rating} size={14} />
              <span className="muted small">{new Date(r.createdAt).toLocaleDateString()}</span>
              {(user?.id === r.user?._id || user?.role === 'admin') && (
                <button className="link-btn" onClick={() => remove(r._id)}>Delete</button>
              )}
            </div>
            {r.comment && <p>{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
