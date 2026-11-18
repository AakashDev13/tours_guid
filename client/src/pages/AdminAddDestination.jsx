import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES, BUDGETS } from '../constants.js';

const empty = {
  name: '', city: '', country: '', category: 'city', budget: 'mid',
  image: '', bestTime: '', description: '', attractionsText: '',
};

// Attractions are typed one per line as:  Name | Description | Tip
const parseAttractions = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, description = '', tip = ''] = line.split('|').map((s) => s.trim());
      return { name, description, tip };
    });

export default function AdminAddDestination() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { attractionsText, ...rest } = form;
      const res = await api('/destinations', {
        method: 'POST',
        body: { ...rest, attractions: parseAttractions(attractionsText) },
      });
      navigate(`/destinations/${res.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form wide-form" onSubmit={submit}>
      <h1>Add a destination</h1>
      {error && <p className="error">{error}</p>}
      <div className="two-col">
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>City<input required value={form.city} onChange={set('city')} /></label>
        <label>Country<input required value={form.country} onChange={set('country')} /></label>
        <label>Best time to visit<input value={form.bestTime} onChange={set('bestTime')} placeholder="e.g. October to March" /></label>
        <label>Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>Budget
          <select value={form.budget} onChange={set('budget')}>
            {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>
      </div>
      <label>Image URL<input value={form.image} onChange={set('image')} placeholder="https://..." /></label>
      <label>Description<textarea required rows="4" value={form.description} onChange={set('description')} /></label>
      <label>
        Attractions (one per line: Name | Description | Tip)
        <textarea
          rows="5"
          value={form.attractionsText}
          onChange={set('attractionsText')}
          placeholder="Eiffel Tower | Iconic iron tower | Book tickets online"
        />
      </label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Create destination'}</button>
    </form>
  );
}
