import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import DestinationCard from '../components/DestinationCard.jsx';
import { CATEGORIES } from '../constants.js';

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/destinations?sort=rating&limit=3')
      .then((d) => setFeatured(d.data))
      .catch((e) => setError(e.message));
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/destinations?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Find your next adventure</h1>
        <p>Discover destinations, top attractions and insider tips from fellow travellers.</p>
        <form className="search-bar" onSubmit={search}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a city, country or place..."
            aria-label="Search destinations"
          />
          <button className="btn btn-primary">Search</button>
        </form>
      </section>

      <section>
        <h2>Browse by interest</h2>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <Link key={c.value} className="chip" to={`/destinations?category=${c.value}`}>
              <span>{c.icon}</span> {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Top rated destinations</h2>
          <Link to="/destinations">See all →</Link>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="grid">
          {featured.map((d) => (
            <DestinationCard key={d._id} destination={d} />
          ))}
        </div>
      </section>
    </>
  );
}
