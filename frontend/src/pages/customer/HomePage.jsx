// Customer page: UI and actions for the HomePage screen.

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  useEffect(() => {
    document.body.classList.add('home-page-bg');
    return () => {
      document.body.classList.remove('home-page-bg');
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Style that fits your day, budget, and mood...</h1>
        <p className="hero-description">
          Browse categories, add products to cart, place orders, simulate payments, and track your
          purchase history.
        </p>
        <div className="row hero-actions">
          <Link className="btn" to="/products">
            Explore Products
          </Link>
          <Link className="btn secondary" to="/admin/login">
            Admin Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;


