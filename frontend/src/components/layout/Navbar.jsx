// Layout component: shared navigation and page shell for Navbar.

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function Navbar() {
  const { customer, logoutCustomer } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Online Clothes Store
      </Link>

      <nav className="nav-links">
        <NavLink to="/products">Products</NavLink>
        {customer && <NavLink to="/orders">Orders</NavLink>}
        {customer && <NavLink to="/profile">Profile</NavLink>}
      </nav>

      <div className="nav-actions">
        <button className="chip" onClick={() => navigate('/cart')} type="button">
          Cart ({itemCount})
        </button>
        {!customer ? (
          <>
            <button className="chip" onClick={() => navigate('/login')} type="button">
              Login
            </button>
            <button className="chip strong" onClick={() => navigate('/register')} type="button">
              Register
            </button>
          </>
        ) : (
          <button
            className="chip"
            onClick={() => {
              logoutCustomer();
              refreshCart();
              navigate('/');
            }}
            type="button"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;


