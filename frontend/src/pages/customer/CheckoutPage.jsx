// Customer page: UI and actions for the CheckoutPage screen.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';

const paymentOptions = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' }
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [newAddress, setNewAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentDropdownRef = useRef(null);

  const loadAddresses = async () => {
    try {
      const { data } = await api.get('/customers/me/addresses');
      setAddresses(data.data);
      if (data.data[0]) setAddressId(String(data.data[0].id));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load addresses');
    }
  };

  useEffect(() => {
    refreshCart();
    loadAddresses();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const saveAddress = async () => {
    try {
      const { data } = await api.post('/customers/me/addresses', newAddress);
      setAddresses((prev) => [data.data, ...prev]);
      setAddressId(String(data.data.id));
      setNewAddress({
        line1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      });
      setMessage('Address saved');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save address');
    }
  };

  const placeOrder = async () => {
    if (!cart.items.length) {
      setMessage('Cart is empty');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data: orderRes } = await api.post('/orders', {
        addressId: addressId ? Number(addressId) : undefined
      });

      await api.post('/payments', {
        orderId: orderRes.data.id,
        paymentMethod
      });

      await refreshCart();
      navigate('/order-success', {
        state: { orderId: orderRes.data.id },
        replace: true
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentLabel =
    paymentOptions.find((option) => option.value === paymentMethod)?.label || 'Select payment';

  return (
    <section className="checkout">
      <h2>Checkout</h2>
      <div className="card">
        <h3>Cart Summary</h3>
        <p>Items: {cart.items.length}</p>
        <p>Total: INR {Number(cart.total || 0).toFixed(2)}</p>
      </div>

      <div className="card">
        <h3>Delivery Address</h3>
        <select className="input" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
          <option value="">Select address</option>
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.line1}, {address.city}, {address.state}
            </option>
          ))}
        </select>
        <div className="grid two">
          <input
            className="input"
            placeholder="Address line"
            value={newAddress.line1}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, line1: e.target.value }))}
          />
          <input
            className="input"
            placeholder="City"
            value={newAddress.city}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
          />
          <input
            className="input"
            placeholder="State"
            value={newAddress.state}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Postal Code"
            value={newAddress.postalCode}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
          />
        </div>
        <button className="btn secondary" type="button" onClick={saveAddress}>
          Save New Address
        </button>
      </div>

      <div className="card">
        <h3>Payment</h3>
        <div className="grid two payment-split">
          <div className="payment-action">
            <label className="file-label" htmlFor="place-order-btn">
              Place Order
            </label>
            <button
              id="place-order-btn"
              className="btn payment-place-btn"
              disabled={loading}
              type="button"
              onClick={placeOrder}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
          <div className="payment-method-wrap">
            <label className="file-label" htmlFor="payment-method-trigger">
              Payment Option
            </label>
            <div className="payment-dropdown" ref={paymentDropdownRef}>
              <button
                id="payment-method-trigger"
                className="input payment-dropdown-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isPaymentDropdownOpen}
                onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
              >
                <span>{selectedPaymentLabel}</span>
                <span className="payment-dropdown-caret" aria-hidden="true">
                  v
                </span>
              </button>
              {isPaymentDropdownOpen && (
                <div className="payment-dropdown-menu" role="listbox" aria-label="Payment option">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`payment-dropdown-option ${
                        paymentMethod === option.value ? 'active' : ''
                      }`}
                      type="button"
                      role="option"
                      aria-selected={paymentMethod === option.value}
                      onClick={() => {
                        setPaymentMethod(option.value);
                        setIsPaymentDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {message && <p className={message.includes('success') ? 'success-text' : 'error-text'}>{message}</p>}
    </section>
  );
}

export default CheckoutPage;


