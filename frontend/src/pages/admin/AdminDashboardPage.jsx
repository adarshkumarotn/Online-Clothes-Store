// Admin page: UI and actions for the AdminDashboardPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';
import Loader from '../../components/common/Loader';

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, categories, orders, customers] = await Promise.all([
          api.get('/products', { params: { includeInactive: true, limit: 200 } }),
          api.get('/categories'),
          api.get('/orders/all'),
          api.get('/customers')
        ]);
        setStats({
          products: products.data.pagination.total,
          categories: categories.data.data.length,
          orders: orders.data.data.length,
          customers: customers.data.data.length
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader message="Loading dashboard..." />;

  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div className="grid four">
        <article className="stat-card">
          <p>Total Products</p>
          <h3>{stats.products}</h3>
        </article>
        <article className="stat-card">
          <p>Total Categories</p>
          <h3>{stats.categories}</h3>
        </article>
        <article className="stat-card">
          <p>Total Orders</p>
          <h3>{stats.orders}</h3>
        </article>
        <article className="stat-card">
          <p>Total Customers</p>
          <h3>{stats.customers}</h3>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboardPage;


