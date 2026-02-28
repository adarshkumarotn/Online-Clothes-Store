// Controller: handles API request/response flow for customerController features.

const Customer = require('../models/Customer');
const Address = require('../models/Address');

async function getCustomers(req, res, next) {
  try {
    const customers = await Customer.getAll();
    return res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    return next(error);
  }
}

async function getCustomerById(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
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

async function updateCustomerStatus(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    await Customer.updateStatus(req.params.id, req.body.isActive ? 1 : 0);
    return res.json({
      success: true,
      message: 'Customer status updated',
      data: await Customer.findById(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyAddresses(req, res, next) {
  try {
    const addresses = await Address.getCustomerAddresses(req.user.id);
    return res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    return next(error);
  }
}

async function addAddress(req, res, next) {
  try {
    const id = await Address.createAddress(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Address added',
      data: await Address.findById(id)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getMyAddresses,
  addAddress
};


