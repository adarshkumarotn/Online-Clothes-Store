// Customer page: UI and actions for the RegisterPage screen.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function RegisterPage() {
  const { registerCustomer } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined
    };
    try {
      await registerCustomer(payload);
      await refreshCart();
      window.alert('Registration successful. Please login to continue.');
      navigate('/login');
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Registration failed';

      const isAlreadyRegistered =
        err.response?.status === 409 ||
        String(message).toLowerCase().includes('already registered');

      if (isAlreadyRegistered) {
        window.alert('Email already registered');
        navigate('/login');
        return;
      }

      setError(message);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Create Account</h2>
        <input
          className="input"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Phone (Optional)"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit">
          Register
        </button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

export default RegisterPage;


