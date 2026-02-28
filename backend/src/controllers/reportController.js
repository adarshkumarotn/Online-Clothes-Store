// Controller: handles API request/response flow for reportController features.

const reportService = require('../services/reportService');

function normalizeDateRange(req) {
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const from =
    req.query.from ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return { from, to };
}

async function salesByDate(req, res, next) {
  try {
    const { from, to } = normalizeDateRange(req);
    const data = await reportService.salesByDate(from, to);
    return res.json({
      success: true,
      data,
      range: { from, to }
    });
  } catch (error) {
    return next(error);
  }
}

async function salesByCategory(req, res, next) {
  try {
    const { from, to } = normalizeDateRange(req);
    const data = await reportService.salesByCategory(from, to);
    return res.json({
      success: true,
      data,
      range: { from, to }
    });
  } catch (error) {
    return next(error);
  }
}

async function topProducts(req, res, next) {
  try {
    const parsed = Number(req.query.limit);
    const limit = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 10;
    const data = await reportService.topProducts(limit);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

async function lowStock(req, res, next) {
  try {
    const hasThreshold = req.query.threshold !== undefined && req.query.threshold !== '';
    const parsed = Number(req.query.threshold);
    const threshold =
      hasThreshold && Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
    const data = await reportService.lowStock(threshold);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return next(error);
  }
}

async function customerPurchases(req, res, next) {
  try {
    const { from, to } = normalizeDateRange(req);
    const data = await reportService.customerPurchases(from, to);
    return res.json({
      success: true,
      data,
      range: { from, to }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  salesByDate,
  salesByCategory,
  topProducts,
  lowStock,
  customerPurchases
};


