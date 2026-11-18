import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import DestinationCard from '../components/DestinationCard.jsx';
import { CATEGORIES, BUDGETS } from '../constants.js';

export default function Destinations() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const budget = params.get('budget') || '';
  const sort = params.get('sort') || 'rating';
  const page = parseInt(params.get('page'), 10) || 1;

  const [text, setText] = useState(q);
  const [result, setResult] = useState({ data: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep the search box in sync with the URL
  useEffect(() => setText(q), [q]);

  useEffect(() => {
    const qs = new URLSearchParams({ sort, page, limit: 9 });
    if (q) qs.set('q', q);
    if (category) qs.set('category', category);
    if (budget) qs.set('budget', budget);

    setLoading(true);
    setError('');
    api(`/destinations?${qs}`)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category, budget, sort, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  return (
    <>
      <h1>Explore destinations</h1>

      <form className="filters" onSubmit={(e) => { e.preventDefault(); update({ q: text.trim() }); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search..." aria-label="Search" />
        <select value={category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={budget} onChange={(e) => update({ budget: e.target.value })} aria-label="Budget">
          <option value="">Any budget</option>
          {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
          <option value="name">A to Z</option>
        </select>
        <button className="btn btn-primary">Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="empty">Loading...</p>
      ) : result.data.length === 0 ? (
        <p className="empty">No destinations match your filters.</p>
      ) : (
        <>
          <p className="muted">{result.total} destination{result.total === 1 ? '' : 's'} found</p>
          <div className="grid">
            {result.data.map((d) => <DestinationCard key={d._id} destination={d} />)}
          </div>
          {result.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>
                ← Prev
              </button>
              <span>Page {page} of {result.pages}</span>
              <button className="btn btn-outline" disabled={page >= result.pages} onClick={() => update({ page: page + 1 })}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
