// Admin page: UI and actions for the ManageCustomersPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';

function ManageCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (customer) => {
    try {
      await api.patch(`/customers/${customer.id}/status`, {
        isActive: !Boolean(customer.is_active)
      });
      await load();
      setMessage('Customer status updated');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <section>
      <h2>Manage Customers</h2>
      {message && <p className={message.includes('failed') ? 'error-text' : 'success-text'}>{message}</p>}
      <div className="list">
        {customers.map((customer) => (
          <article className="list-row" key={customer.id}>
            <div>
              <h3>
                {customer.first_name} {customer.last_name}
              </h3>
              <p>{customer.email}</p>
              <p>{customer.phone || 'No phone'}</p>
            </div>
            <button className="chip" type="button" onClick={() => toggleStatus(customer)}>
              {customer.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ManageCustomersPage;


