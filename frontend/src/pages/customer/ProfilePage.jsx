// Customer page: UI and actions for the ProfilePage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const { customer } = useAuth();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/customers/me/addresses');
        setAddresses(data.data);
      } catch (error) {
        setAddresses([]);
      }
    };
    fetchAddresses();
  }, []);

  if (!customer) return null;

  return (
    <section>
      <h2>My Profile</h2>
      <div className="card">
        <p>
          <strong>Name:</strong> {customer.first_name} {customer.last_name}
        </p>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone || 'N/A'}
        </p>
      </div>
      <div className="card">
        <h3>Saved Addresses</h3>
        {!addresses.length ? (
          <p>No addresses added yet.</p>
        ) : (
          addresses.map((address) => (
            <p key={address.id}>
              {address.line1}, {address.city}, {address.state} - {address.postal_code}
            </p>
          ))
        )}
      </div>
    </section>
  );
}

export default ProfilePage;


