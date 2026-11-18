import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h1>Welcome back</h1>
      {error && <p className="error">{error}</p>}
      <label>Email
        <input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
      </label>
      <label>Password
        <input type="password" required value={form.password} onChange={set('password')} autoComplete="current-password" />
      </label>
      <button className="btn btn-primary wide" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      <p className="muted">No account? <Link to="/register">Sign up</Link></p>
    </form>
  );
}
