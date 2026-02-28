// Customer page: UI and actions for the ProductDetailsPage screen.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/common/Loader';
import { handleImageError, resolveImageUrl } from '../../utils/image';
import { getSizeOptions } from '../../utils/sizeOptions';

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const sizeOptions = getSizeOptions(product?.category_name);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
        setSize('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader message="Loading product details..." />;
  if (error) return <p className="error-text">{error}</p>;
  if (!product) return null;

  return (
    <section>
      <h2>Product Details</h2>
      <article className="product-details">
        <img
          src={resolveImageUrl(product.image_url)}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
        <div>
          <p className="eyebrow">{product.category_name}</p>
          <h2>{product.name}</h2>
          <p>{product.description || 'No description available.'}</p>
          <p className="price">INR {Number(product.price).toFixed(2)}</p>
          {sizeOptions.length > 0 && (
            <div className="row wrap">
              <label htmlFor="product-size">
                <strong>Size:</strong>
              </label>
              <select
                id="product-size"
                className="input"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="">Select size</option>
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p>Stock: {product.stock}</p>
          <div className="row">
            <input
              className="input qty"
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (sizeOptions.length > 0 && !size) {
                  alert('Please select size');
                  return;
                }
                addToCart(product.id, qty, product, size);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

export default ProductDetailsPage;


