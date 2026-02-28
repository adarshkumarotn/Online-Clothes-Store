// Admin page: UI and actions for the AdminLoginPage screen.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@store.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <section className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Admin Login</h2>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit">
          Login as Admin
        </button>
      </form>
    </section>
  );
}

export default AdminLoginPage;


