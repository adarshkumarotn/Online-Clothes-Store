// Controller: handles API request/response flow for adminAuthController features.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: 'admin'
    },
    process.env.JWT_ADMIN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const isMatch = admin.password_hash.startsWith('$2')
      ? await bcrypt.compare(password, admin.password_hash)
      : password === admin.password_hash;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const token = signAdminToken(admin);
    return res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function profile(req, res, next) {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    return res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  profile
};


   