// Controller: handles API request/response flow for authController features.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Cart = require('../models/Cart');
const ActivityLog = require('../models/ActivityLog');

function signCustomerToken(customer) {
  return jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      role: 'customer'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existing = await Customer.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = await Customer.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone
    });

    await Cart.getOrCreateCart(customerId);
    await ActivityLog.create({
      actorType: 'customer',
      actorId: customerId,
      action: 'REGISTER',
      details: `Customer ${email} registered`
    });

    const customer = await Customer.findById(customerId);
    const token = signCustomerToken({
      id: customerId,
      email: customer.email
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        customer
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findByEmail(email);

    if (!customer || !customer.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = customer.password_hash.startsWith('$2')
      ? await bcrypt.compare(password, customer.password_hash)
      : password === customer.password_hash;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await Cart.getOrCreateCart(customer.id);
    const token = signCustomerToken(customer);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        customer: await Customer.findById(customer.id)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function profile(req, res, next) {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logout successful (client should remove token)'
  });
}

module.exports = {
  register,
  login,
  profile,
  logout
};


