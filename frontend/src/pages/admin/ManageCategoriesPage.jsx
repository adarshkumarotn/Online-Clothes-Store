// Admin page: UI and actions for the ManageCategoriesPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';

function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, form);
        setMessage('Category updated');
      } else {
        await api.post('/categories', form);
        setMessage('Category created');
      }
      setForm({ name: '', description: '' });
      setEditId(null);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await load();
      setMessage('Category deleted');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <section>
      <h2>Manage Categories</h2>
      <form className="card" onSubmit={submit}>
        <div className="grid two">
          <input
            className="input"
            placeholder="Category Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <button className="btn" type="submit">
          {editId ? 'Update Category' : 'Add Category'}
        </button>
      </form>

      {message && <p className={message.includes('failed') ? 'error-text' : 'success-text'}>{message}</p>}

      <div className="list">
        {categories.map((category) => (
          <article className="list-row" key={category.id}>
            <div>
              <h3>{category.name}</h3>
              <p>{category.description || 'No description'}</p>
            </div>
            <div className="row">
              <button
                className="chip"
                type="button"
                onClick={() => {
                  setEditId(category.id);
                  setForm({
                    name: category.name,
                    description: category.description || ''
                  });
                }}
              >
                Edit
              </button>
              <button className="chip danger" type="button" onClick={() => setPendingDelete(category)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {pendingDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="confirm-dialog">
            <h3 id="delete-title">Delete Category</h3>
            <p>
              Are you sure you want to delete <strong>{pendingDelete.name}</strong>?
            </p>
            <div className="row confirm-actions">
              <button className="chip" type="button" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="chip danger" type="button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageCategoriesPage;


