import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DestImage from './DestImage.jsx';
import StarRating from './StarRating.jsx';
import { categoryIcon } from '../constants.js';

export default function DestinationCard({ destination: d }) {
  const { user, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isFav = user?.favorites?.includes(String(d._id));

  const onHeart = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await toggleFavorite(d._id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Link to={`/destinations/${d._id}`} className="card">
      <div className="card-img">
        <DestImage src={d.image} alt={d.name} category={d.category} />
        <span className="badge">{categoryIcon(d.category)} {d.category}</span>
        <button
          className={isFav ? 'heart active' : 'heart'}
          onClick={onHeart}
          aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFav ? '♥' : '♡'}
        </button>
      </div>
      <div className="card-body">
        <h3>{d.name}</h3>
        <p className="muted">{d.city}, {d.country}</p>
        <div className="card-meta">
          <StarRating value={d.avgRating} size={15} />
          <span className="muted small">
            {d.numReviews > 0 ? `${d.avgRating} (${d.numReviews})` : 'No reviews'}
          </span>
        </div>
      </div>
    </Link>
  );
}
