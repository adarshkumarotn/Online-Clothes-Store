// Controller: handles API request/response flow for cartController features.

const Cart = require('../models/Cart');
const Product = require('../models/Product');

function summarizeCart(items) {
  const total = items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);
  return {
    items,
    total
  };
}

async function getCart(req, res, next) {
  try {
    const cartData = await Cart.getCartItems(req.user.id);
    return res.json({
      success: true,
      data: {
        cartId: cartData.cartId,
        ...summarizeCart(cartData.items)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function addToCart(req, res, next) {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);
    const product = await Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product unavailable'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user.id);
    const existing = await Cart.findCartItem(cart.id, productId);
    const nextQuantity = existing ? Number(existing.quantity) + quantity : quantity;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    await Cart.upsertCartItem(cart.id, productId, nextQuantity, product.price);
    const cartData = await Cart.getCartItems(req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cartId: cartData.cartId,
        ...summarizeCart(cartData.items)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);
    const product = await Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product unavailable'
      });
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const cart = await Cart.getOrCreateCart(req.user.id);
    await Cart.upsertCartItem(cart.id, productId, quantity, product.price);
    const cartData = await Cart.getCartItems(req.user.id);
    return res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartId: cartData.cartId,
        ...summarizeCart(cartData.items)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const cart = await Cart.getOrCreateCart(req.user.id);
    await Cart.removeCartItem(cart.id, productId);
    const cartData = await Cart.getCartItems(req.user.id);
    return res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cartId: cartData.cartId,
        ...summarizeCart(cartData.items)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    const cart = await Cart.getOrCreateCart(req.user.id);
    await Cart.clearCart(cart.id);
    return res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        cartId: cart.id,
        items: [],
        total: 0
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};


