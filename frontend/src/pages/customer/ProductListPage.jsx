// Customer page: UI and actions for the ProductListPage screen.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/common/Loader';
import { handleImageError, resolveImageUrl } from '../../utils/image';
import { getSizeOptions } from '../../utils/sizeOptions';

function mixProductsByCategory(products, categories) {
  const grouped = new Map();

  products.forEach((product) => {
    const key = String(product.category_name || '').trim().toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(product);
  });

  const orderedCategoryKeys = categories
    .map((category) => String(category.name || '').trim().toLowerCase())
    .filter((key, index, list) => key && list.indexOf(key) === index);

  grouped.forEach((_, key) => {
    if (!orderedCategoryKeys.includes(key)) {
      orderedCategoryKeys.push(key);
    }
  });

  const buckets = orderedCategoryKeys
    .map((key) => grouped.get(key))
    .filter((items) => Array.isArray(items) && items.length > 0);

  const mixed = [];
  while (true) {
    let hasItems = false;
    buckets.forEach((bucket) => {
      if (bucket.length > 0) {
        mixed.push(bucket.shift());
        hasItems = true;
      }
    });
    if (!hasItems) break;
  }

  return mixed;
}

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products', {
          params: { search, categoryId: categoryId || undefined, limit: 50 }
        }),
        api.get('/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilter = (event) => {
    event.preventDefault();
    fetchData();
  };

  const displayProducts = useMemo(() => {
    if (categoryId || search.trim()) return products;
    return mixProductsByCategory(products, categories);
  }, [products, categories, categoryId, search]);

  if (loading) return <Loader message="Loading products..." />;

  return (
    <section>
      <h2>Product Listing</h2>
      <form className="card row wrap" onSubmit={applyFilter}>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
        />
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="btn" type="submit">
          Apply
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="grid four">
        {displayProducts.map((product) => {
          const sizeOptions = getSizeOptions(product.category_name);
          const selectedSize = selectedSizes[product.id] || '';

          return (
            <article key={product.id} className="product-card">
              <img
                src={resolveImageUrl(product.image_url)}
                alt={product.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div>
                <p className="eyebrow">{product.category_name}</p>
                <h3>{product.name}</h3>
                <p>INR {Number(product.price).toFixed(2)}</p>
                {sizeOptions.length > 0 && (
                  <select
                    id={`product-size-${product.id}`}
                    className="input"
                    value={selectedSize}
                    onChange={(e) =>
                      setSelectedSizes((prev) => ({
                        ...prev,
                        [product.id]: e.target.value
                      }))
                    }
                  >
                    <option value="">Select size</option>
                    {sizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                <p>Stock: {product.stock}</p>
              </div>
              <div className="row">
                <Link className="btn secondary" to={`/products/${product.id}`}>
                  Details
                </Link>
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    if (sizeOptions.length > 0 && !selectedSize) {
                      alert('Please select size');
                      return;
                    }
                    addToCart(product.id, 1, product, selectedSize);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ProductListPage;


