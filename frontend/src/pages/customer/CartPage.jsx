// Customer page: UI and actions for the CartPage screen.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { handleImageError, resolveImageUrl } from '../../utils/image';

function CartPage() {
  const { customer } = useAuth();
  const { cart, loading, refreshCart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const isGuest = !customer;
  const [qtyDrafts, setQtyDrafts] = useState({});

  const getItemKey = (item) => `${item.product_id}-${item.size || 'default'}`;

  useEffect(() => {
    refreshCart();
  }, [customer]);

  useEffect(() => {
    const nextDrafts = {};
    cart.items.forEach((item) => {
      nextDrafts[getItemKey(item)] = String(item.quantity);
    });
    setQtyDrafts(nextDrafts);
  }, [cart.items]);

  const onQtyChange = (item, value) => {
    if (!/^\d*$/.test(value)) return;
    setQtyDrafts((prev) => ({
      ...prev,
      [getItemKey(item)]: value
    }));
  };

  const commitQty = async (item) => {
    const key = getItemKey(item);
    const rawValue = qtyDrafts[key] ?? String(item.quantity);

    if (rawValue === '') {
      setQtyDrafts((prev) => ({
        ...prev,
        [key]: String(item.quantity)
      }));
      return;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setQtyDrafts((prev) => ({
        ...prev,
        [key]: String(item.quantity)
      }));
      return;
    }

    const qty = Math.floor(parsed);
    if (qty <= 0) {
      await removeItem(item.product_id, item.size);
      return;
    }

    const stockLimit = Number(item.stock);
    const clampedQty = Number.isFinite(stockLimit)
      ? Math.min(qty, stockLimit)
      : qty;

    if (clampedQty !== item.quantity) {
      await updateQuantity(item.product_id, clampedQty, item.size);
      return;
    }

    setQtyDrafts((prev) => ({
      ...prev,
      [key]: String(clampedQty)
    }));
  };

  if (loading) return <Loader message="Loading cart..." />;

  return (
    <section>
      <h2>Shopping Cart</h2>
      {!cart.items.length ? (
        <div className="card">
          <p>{isGuest ? 'Your guest cart is empty.' : 'Your cart is empty.'}</p>
          <Link className="btn" to="/products">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="list">
            {cart.items.map((item) => (
              <article key={`${item.product_id}-${item.size || 'default'}`} className="list-row">
                <div className="row">
                  <img
                    className="cart-item-image"
                    src={resolveImageUrl(item.image_url)}
                    alt={item.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                  />
                  <div>
                    {item.category_name && <p className="eyebrow">{item.category_name}</p>}
                    <h3>{item.name}</h3>
                    {item.size && <p>Size: {item.size}</p>}
                    <p>INR {Number(item.unit_price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="row">
                  <input
                    className="input qty"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qtyDrafts[getItemKey(item)] ?? String(item.quantity)}
                    onChange={(e) => onQtyChange(item, e.target.value)}
                    onBlur={() => {
                      void commitQty(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void commitQty(item);
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  <button
                    className="chip"
                    type="button"
                    onClick={() => removeItem(item.product_id, item.size)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="card row between">
            <strong>Total: INR {Number(cart.total).toFixed(2)}</strong>
            <div className="row">
              <button className="btn secondary" onClick={clearCart} type="button">
                Clear Cart
              </button>
              {isGuest ? (
                <Link className="btn" to="/login">
                  Go to Login
                </Link>
              ) : (
                <button className="btn" onClick={() => navigate('/checkout')} type="button">
                  Checkout
                </button>
              )}
            </div>
          </div>
          {isGuest && <p className="error-text">Please login to continue checkout.</p>}
        </>
      )}
    </section>
  );
}

export default CartPage;


