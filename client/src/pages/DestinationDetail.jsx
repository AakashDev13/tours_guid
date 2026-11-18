import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import DestImage from '../components/DestImage.jsx';
import StarRating from '../components/StarRating.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { BUDGETS, categoryIcon } from '../constants.js';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();
  const [dest, setDest] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api(`/destinations/${id}`)
      .then((d) => setDest(d.data))
      .catch((e) => setError(e.message));

  useEffect(() => {
    setDest(null);
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!dest) return <p className="empty">Loading...</p>;

  const isFav = user?.favorites?.includes(String(dest._id));
  const budgetLabel = BUDGETS.find((b) => b.value === dest.budget)?.label;

  const onFav = async () => {
    if (!user) return navigate('/login', { state: { from: `/destinations/${id}` } });
    try {
      await toggleFavorite(dest._id);
    } catch (e) {
      alert(e.message);
    }
  };

  const onDelete = async () => {
    if (!confirm(`Delete ${dest.name}? This also removes its reviews.`)) return;
    try {
      await api(`/destinations/${dest._id}`, { method: 'DELETE' });
      navigate('/destinations');
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <div className="detail-hero">
        <DestImage src={dest.image} alt={dest.name} category={dest.category} />
        <div className="detail-hero-text">
          <span className="badge">{categoryIcon(dest.category)} {dest.category}</span>
          <h1>{dest.name}</h1>
          <p>{dest.city}, {dest.country}</p>
        </div>
      </div>

      <div className="detail-layout">
        <div>
          <section className="panel">
            <h2>About</h2>
            <p>{dest.description}</p>
          </section>

          <section className="panel">
            <h2>Top attractions</h2>
            {dest.attractions.length === 0 && <p className="muted">No attractions listed yet.</p>}
            <ul className="attractions">
              {dest.attractions.map((a, i) => (
                <li key={i}>
                  <h3>{a.name}</h3>
                  {a.description && <p>{a.description}</p>}
                  {a.tip && <p className="tip">💡 {a.tip}</p>}
                </li>
              ))}
            </ul>
          </section>

          <ReviewSection destinationId={dest._id} onChanged={load} />
        </div>

        <aside className="panel side">
          <h2>Quick facts</h2>
          <dl>
            <dt>Rating</dt>
            <dd>
              <StarRating value={dest.avgRating} size={16} />{' '}
              <span className="muted small">
                {dest.numReviews > 0 ? `${dest.avgRating} from ${dest.numReviews} review${dest.numReviews === 1 ? '' : 's'}` : 'No reviews yet'}
              </span>
            </dd>
            <dt>Best time to visit</dt>
            <dd>{dest.bestTime || 'Year-round'}</dd>
            <dt>Budget</dt>
            <dd>{budgetLabel}</dd>
          </dl>
          <button className={isFav ? 'btn btn-outline wide' : 'btn btn-primary wide'} onClick={onFav}>
            {isFav ? '♥ Saved to favorites' : '♡ Save to favorites'}
          </button>
          {user?.role === 'admin' && (
            <button className="btn btn-danger wide" onClick={onDelete}>Delete destination</button>
          )}
        </aside>
      </div>
    </>
  );
}
