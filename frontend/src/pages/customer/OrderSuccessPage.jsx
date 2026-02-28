// Customer page: UI and actions for the OrderSuccessPage screen.

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OrderSuccessPage() {
  const { customer } = useAuth();
  const { state } = useLocation();

  const firstName = customer?.first_name || customer?.firstName || '';
  const lastName = customer?.last_name || customer?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Customer';
  const orderId = state?.orderId;

  return (
    <section className="auth-wrap">
      <article className="card auth-card">
        <h2>Order Placed Successfully</h2>
        <p>
          <strong>{fullName}</strong>, your order is successfully placed.
        </p>
        <p>Thank you for shopping Online Clothes Store.</p>
        {orderId && <p>Order ID: #{orderId}</p>}
        <div className="row">
          <Link className="btn" to="/orders">
            View Orders
          </Link>
          <Link className="btn secondary" to="/">
            Go to Home
          </Link>
        </div>
        <h3>Explore more products</h3>
        <div className="row">
          <Link className="btn" to="/products">
            Product Page
          </Link>
        </div>
      </article>
    </section>
  );
}

export default OrderSuccessPage;
