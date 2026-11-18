import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">🧭 Wanderly</Link>
        <nav className="nav-links">
          <NavLink to="/destinations">Explore</NavLink>
          {user && <NavLink to="/favorites">My Favorites</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/new">Add Destination</NavLink>}
        </nav>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="hello">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
