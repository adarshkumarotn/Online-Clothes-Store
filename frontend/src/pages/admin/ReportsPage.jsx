// Admin page: UI and actions for the ReportsPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';

function ReportsPage() {
  const [reports, setReports] = useState({
    salesByDate: [],
    salesByCategory: [],
    topProducts: [],
    lowStock: [],
    customerPurchases: []
  });
  const [message, setMessage] = useState('');

  const loadReports = async () => {
    try {
      const [salesByDate, salesByCategory, topProducts, lowStock, customerPurchases] =
        await Promise.all([
          api.get('/reports/sales-by-date'),
          api.get('/reports/sales-by-category'),
          api.get('/reports/top-products'),
          api.get('/reports/low-stock'),
          api.get('/reports/customer-purchases')
        ]);

      setReports({
        salesByDate: salesByDate.data.data,
        salesByCategory: salesByCategory.data.data,
        topProducts: topProducts.data.data,
        lowStock: lowStock.data.data,
        customerPurchases: customerPurchases.data.data
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load reports');
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <section>
      <h2>Reports</h2>
      {message && <p className="error-text">{message}</p>}

      <div className="card">
        <h3>Total Sales by Date</h3>
        {reports.salesByDate.map((row) => (
          <p key={row.sale_date}>
            {row.sale_date}: INR {Number(row.total_sales || 0).toFixed(2)} ({row.total_orders} orders)
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Sales by Category</h3>
        {reports.salesByCategory.map((row) => (
          <p key={row.category_id}>
            {row.category_name}: INR {Number(row.total_sales || 0).toFixed(2)} ({row.total_units} units)
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Top Selling Products</h3>
        {reports.topProducts.map((row) => (
          <p key={row.product_id}>
            {row.name}: {row.total_units} units | INR {Number(row.total_sales || 0).toFixed(2)}
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Low Stock Report</h3>
        {reports.lowStock.map((row) => (
          <p key={row.id}>
            {row.name} ({row.category_name}) - {row.stock} left
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Customer Purchase Report</h3>
        {reports.customerPurchases.map((row) => (
          <p key={row.customer_id}>
            {row.customer_name} ({row.email}) - Orders: {row.total_orders}, Spent: INR{' '}
            {Number(row.total_spent || 0).toFixed(2)}
          </p>
        ))}
      </div>
    </section>
  );
}

export default ReportsPage;


