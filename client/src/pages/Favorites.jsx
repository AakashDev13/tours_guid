import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import DestinationCard from '../components/DestinationCard.jsx';

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/users/favorites')
      .then((d) => setItems(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Removing a heart updates user.favorites; hide the card straight away
  const visible = items.filter((d) => user?.favorites?.includes(String(d._id)));

  if (loading) return <p className="empty">Loading...</p>;

  return (
    <>
      <h1>My favorites</h1>
      {error && <p className="error">{error}</p>}
      {visible.length === 0 ? (
        <p className="empty">
          Nothing saved yet. <Link to="/destinations">Explore destinations</Link> and tap the heart.
        </p>
      ) : (
        <div className="grid">
          {visible.map((d) => <DestinationCard key={d._id} destination={d} />)}
        </div>
      )}
    </>
  );
}
