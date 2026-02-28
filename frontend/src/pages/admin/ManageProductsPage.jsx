// Admin page: UI and actions for the ManageProductsPage screen.

import { useEffect, useState } from 'react';
import api from '../../api/client';
import { handleImageError, resolveImageUrl } from '../../utils/image';

const initialForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  isActive: true
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const fetchData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get('/products', { params: { includeInactive: true, limit: 300 } }),
      api.get('/categories')
    ]);
    setProducts(productsRes.data.data);
    setCategories(categoriesRes.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setHasError(false);

    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock)
      };
      if (selectedImageFile) {
        payload.imageBase64 = await fileToDataUrl(selectedImageFile);
      }

      if (editId) {
        await api.put(`/products/${editId}`, payload);
        setMessage('Product updated');
      } else {
        await api.post('/products', payload);
        setMessage('Product created');
      }
      setForm(initialForm);
      setEditId(null);
      setSelectedImageFile(null);
      setImagePreview('');
      setFileInputKey((value) => value + 1);
      await fetchData();
    } catch (error) {
      setHasError(true);
      setMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const onSelectImage = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedImageFile(file);
    if (!file) {
      setImagePreview('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (product) => {
    setEditId(product.id);
    setForm({
      categoryId: String(product.category_id),
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      isActive: Boolean(product.is_active)
    });
    setSelectedImageFile(null);
    setFileInputKey((value) => value + 1);
    setImagePreview(product.image_url ? resolveImageUrl(product.image_url) : '');
  };

  const remove = async (id) => {
    try {
      setHasError(false);
      await api.delete(`/products/${id}`);
      await fetchData();
      setMessage('Product deleted');
    } catch (error) {
      setHasError(true);
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <section>
      <h2>Manage Products</h2>
      <form className="card grid two" onSubmit={submit}>
        <select
          className="input"
          value={form.categoryId}
          onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
          required
        />
        <div className="file-field">
          <label className="file-label" htmlFor="product-image-file">
            Product Image
          </label>
          <input
            key={fileInputKey}
            id="product-image-file"
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={onSelectImage}
          />
        </div>
        <label className="check-wrap">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          Active Product
        </label>
        <textarea
          className="input full"
          rows="3"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        {imagePreview && (
          <div className="file-preview">
            <img src={imagePreview} alt="Selected product preview" onError={handleImageError} />
          </div>
        )}
        <button className="btn" type="submit">
          {editId ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {message && <p className={hasError ? 'error-text' : 'success-text'}>{message}</p>}

      <div className="list">
        {products.map((product) => (
          <article className="list-row" key={product.id}>
            <div>
              <h3>{product.name}</h3>
              <p>
                INR {Number(product.price).toFixed(2)} | Stock: {product.stock} |{' '}
                {product.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="row">
              <button className="chip" type="button" onClick={() => startEdit(product)}>
                Edit
              </button>
              <button className="chip danger" type="button" onClick={() => remove(product.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ManageProductsPage;


