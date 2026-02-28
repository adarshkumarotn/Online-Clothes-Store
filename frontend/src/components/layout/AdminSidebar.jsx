// Layout component: shared navigation and page shell for AdminSidebar.

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminSidebar() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <h3>Admin Panel</h3>
      <p>{admin?.name}</p>
      <NavLink to="/admin/dashboard">Dashboard</NavLink>
      <NavLink to="/admin/products">Products</NavLink>
      <NavLink to="/admin/categories">Categories</NavLink>
      <NavLink to="/admin/orders">Orders</NavLink>
      <NavLink to="/admin/customers">Customers</NavLink>
      <NavLink to="/admin/reports">Reports</NavLink>
      <button
        type="button"
        className="chip"
        onClick={() => {
          logoutAdmin();
          navigate('/admin/login');
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;


