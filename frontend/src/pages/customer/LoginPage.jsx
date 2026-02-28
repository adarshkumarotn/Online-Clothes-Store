// Customer page: UI and actions for the LoginPage screen.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function LoginPage() {
  const { loginCustomer } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await loginCustomer(email, password);
      await refreshCart();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Customer Login</h2>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit">
          Login
        </button>
        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;


