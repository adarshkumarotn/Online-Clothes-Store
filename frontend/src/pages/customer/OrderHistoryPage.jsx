// Customer page: UI and actions for the OrderHistoryPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';
import Loader from '../../components/common/Loader';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader message="Loading orders..." />;

  return (
    <section>
      <h2>Order History</h2>
      {error && <p className="error-text">{error}</p>}
      {!orders.length ? (
        <div className="card">
          <p>No orders placed yet.</p>
        </div>
      ) : (
        <div className="list">
          {orders.map((order) => (
            <article key={order.id} className="card">
              <p>
                <strong>Order #{order.id}</strong> | Status: {order.status}
              </p>
              <p>Total: INR {Number(order.total_amount).toFixed(2)}</p>
              <p>Placed on: {new Date(order.created_at).toLocaleString()}</p>
              <div className="mini-list">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.product_name} x {item.quantity}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistoryPage;


