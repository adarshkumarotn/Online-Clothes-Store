// Admin page: UI and actions for the ManageOrdersPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';
import { handleImageError, resolveImageUrl } from '../../utils/image';

const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get('/orders/all');
    setOrders(data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await load();
      setMessage(`Order #${orderId} updated`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Status update failed');
    }
  };

  const formatAddress = (order) => {
    const parts = [
      order.address_line1,
      order.address_line2,
      order.address_city,
      order.address_state,
      order.address_postal_code,
      order.address_country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <section>
      <h2>Manage Orders</h2>
      {message && <p className={message.includes('failed') ? 'error-text' : 'success-text'}>{message}</p>}
      <div className="list">
        {orders.map((order) => (
          <article className="card" key={order.id}>
            <div className="order-header">
              <div className="order-meta">
                <h3>
                  Order #{order.id} - {order.first_name} {order.last_name}
                </h3>
                <p>{order.email}</p>
                {order.phone && <p>{order.phone}</p>}
                {order.created_at && <p>Placed on: {new Date(order.created_at).toLocaleString()}</p>}
                {formatAddress(order) && <p>Address: {formatAddress(order)}</p>}
                <p>Total: INR {Number(order.total_amount).toFixed(2)}</p>
              </div>
              <div className="order-status-field">
                <label htmlFor={`order-status-${order.id}`} className="file-label">
                  Status
                </label>
                <select
                  id={`order-status-${order.id}`}
                  className="input"
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="order-items-admin">
              {order.items?.length ? (
                order.items.map((item) => (
                  <article className="order-item-admin" key={item.id}>
                    <img
                      className="cart-item-image"
                      src={resolveImageUrl(item.image_url)}
                      alt={item.product_name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                    <div>
                      {item.category_name && <p className="eyebrow">{item.category_name}</p>}
                      <h4>{item.product_name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Unit Price: INR {Number(item.unit_price).toFixed(2)}</p>
                      <p>Subtotal: INR {(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="mini-list">No product details available for this order.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ManageOrdersPage;


