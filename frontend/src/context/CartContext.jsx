// React context: shared state/actions provider for CartContext.

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const CartContext = createContext(null);
const EMPTY_CART = { items: [], total: 0 };
const GUEST_CART_KEY = 'guestCart';
const UNKNOWN_STOCK = 999999;

function toPositiveInt(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function toNonNegativeNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
}

function normalizeSize(size) {
  const value = String(size || '').trim();
  return value || '';
}

function normalizeGuestItem(item) {
  if (!item) return null;
  const productId = Number(item.product_id ?? item.productId);
  if (!Number.isFinite(productId) || productId <= 0) return null;

  const stock = toPositiveInt(item.stock, UNKNOWN_STOCK);
  const quantity = Math.min(toPositiveInt(item.quantity, 1), stock);

  return {
    product_id: Math.floor(productId),
    name: String(item.name || 'Product'),
    category_name: String(item.category_name ?? item.categoryName ?? ''),
    unit_price: toNonNegativeNumber(item.unit_price ?? item.unitPrice, 0),
    quantity,
    stock,
    image_url: String(item.image_url ?? item.imageUrl ?? '/placeholder.svg'),
    size: normalizeSize(item.size)
  };
}

function buildGuestCart(items = []) {
  const normalizedItems = items.map(normalizeGuestItem).filter(Boolean);
  const total = normalizedItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0
  );
  return {
    items: normalizedItems,
    total
  };
}

function readGuestCart() {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
    return buildGuestCart(items);
  } catch {
    return EMPTY_CART;
  }
}

function saveGuestCart(cart) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

function clearGuestCartStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return EMPTY_CART;
    return localStorage.getItem('customerToken') ? EMPTY_CART : readGuestCart();
  });
  const [loading, setLoading] = useState(false);

  const syncGuestCartToServer = async () => {
    const guestCart = readGuestCart();
    if (!guestCart.items.length) return;

    // Clear local guest cart first so duplicate refresh calls do not sync same items again.
    clearGuestCartStorage();
    const failedItems = [];

    for (const item of guestCart.items) {
      try {
        await api.post('/cart/items', {
          productId: item.product_id,
          quantity: item.quantity
        });
      } catch {
        failedItems.push(item);
      }
    }

    // Restore only items that failed to sync, so user does not lose them.
    if (failedItems.length) {
      saveGuestCart(buildGuestCart(failedItems));
    }
  };

  const refreshCart = async () => {
    if (!localStorage.getItem('customerToken')) {
      setCart(readGuestCart());
      return;
    }

    setLoading(true);
    try {
      await syncGuestCartToServer();
      const { data } = await api.get('/cart');
      setCart(data.data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId, quantity = 1, productData = null, selectedSize = '') => {
    const safeProductId = Number(productId);
    const safeQuantity = toPositiveInt(quantity, 1);
    const normalizedSize = normalizeSize(selectedSize);

    if (localStorage.getItem('customerToken')) {
      await api.post('/cart/items', {
        productId: safeProductId,
        quantity: safeQuantity
      });
      await refreshCart();
      return;
    }

    const nextCart = readGuestCart();
    const existingIndex = nextCart.items.findIndex(
      (item) => item.product_id === safeProductId && normalizeSize(item.size) === normalizedSize
    );

    let resolvedProduct = productData;
    if (!resolvedProduct && existingIndex === -1) {
      try {
        const { data } = await api.get(`/products/${safeProductId}`);
        resolvedProduct = data.data;
      } catch {
        resolvedProduct = null;
      }
    }

    if (existingIndex >= 0) {
      const existingItem = nextCart.items[existingIndex];
      const stockLimit = toPositiveInt(
        resolvedProduct?.stock ?? existingItem.stock ?? UNKNOWN_STOCK,
        UNKNOWN_STOCK
      );
      const nextQuantityValue = Math.min(existingItem.quantity + safeQuantity, stockLimit);
      nextCart.items[existingIndex] = normalizeGuestItem({
        ...existingItem,
        name: resolvedProduct?.name ?? existingItem.name,
        category_name: resolvedProduct?.category_name ?? existingItem.category_name,
        unit_price: resolvedProduct?.price ?? existingItem.unit_price,
        stock: stockLimit,
        image_url: resolvedProduct?.image_url ?? existingItem.image_url,
        size: normalizedSize || existingItem.size,
        quantity: nextQuantityValue
      });
    } else {
      const stockLimit = toPositiveInt(resolvedProduct?.stock, UNKNOWN_STOCK);
      nextCart.items.push(
        normalizeGuestItem({
          product_id: safeProductId,
          name: resolvedProduct?.name ?? 'Product',
          category_name: resolvedProduct?.category_name ?? '',
          unit_price: resolvedProduct?.price ?? 0,
          stock: stockLimit,
          quantity: Math.min(safeQuantity, stockLimit),
          image_url: resolvedProduct?.image_url ?? '/placeholder.svg',
          size: normalizedSize
        })
      );
    }

    const normalized = buildGuestCart(nextCart.items);
    saveGuestCart(normalized);
    setCart(normalized);
  };

  const updateQuantity = async (productId, quantity, selectedSize = '') => {
    const safeProductId = Number(productId);
    const safeQuantity = toPositiveInt(quantity, 1);
    const normalizedSize = normalizeSize(selectedSize);

    if (localStorage.getItem('customerToken')) {
      await api.put(`/cart/items/${safeProductId}`, { quantity: safeQuantity });
      await refreshCart();
      return;
    }

    const current = readGuestCart();
    const updatedItems = current.items.map((item) => {
      if (
        item.product_id !== safeProductId ||
        normalizeSize(item.size) !== normalizedSize
      ) {
        return item;
      }
      return {
        ...item,
        quantity: Math.min(safeQuantity, toPositiveInt(item.stock, UNKNOWN_STOCK))
      };
    });

    const normalized = buildGuestCart(updatedItems);
    saveGuestCart(normalized);
    setCart(normalized);
  };

  const removeItem = async (productId, selectedSize = '') => {
    const safeProductId = Number(productId);
    const normalizedSize = normalizeSize(selectedSize);

    if (localStorage.getItem('customerToken')) {
      await api.delete(`/cart/items/${safeProductId}`);
      await refreshCart();
      return;
    }

    const current = readGuestCart();
    const normalized = buildGuestCart(
      current.items.filter(
        (item) =>
          item.product_id !== safeProductId ||
          normalizeSize(item.size) !== normalizedSize
      )
    );
    saveGuestCart(normalized);
    setCart(normalized);
  };

  const clearCart = async () => {
    if (localStorage.getItem('customerToken')) {
      await api.delete('/cart/clear');
      await refreshCart();
      return;
    }

    clearGuestCartStorage();
    setCart(EMPTY_CART);
  };

  const value = {
    cart,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}


