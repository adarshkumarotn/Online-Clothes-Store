// Controller: handles API request/response flow for productController features.

const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { parsePagination } = require('../utils/pagination');
const { removeLocalImage, saveBase64Image } = require('../utils/imageStorage');

function normalizeProductPayload(body) {
  return {
    categoryId: Number(body.categoryId),
    name: body.name,
    description: body.description,
    price: Number(body.price),
    stock: Number(body.stock),
    imageUrl: body.imageUrl,
    isActive:
      body.isActive === undefined
        ? undefined
        : typeof body.isActive === 'string'
          ? body.isActive === 'true'
          : Boolean(body.isActive)
  };
}

function isDuplicateProductNameError(error) {
  return (
    error?.code === 'ER_DUP_ENTRY' &&
    String(error.message || '').includes('uniq_product')
  );
}

async function getProducts(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query, {
      page: 1,
      limit: 10,
      maxLimit: 200
    });

    const result = await Product.findMany({
      search: req.query.search || '',
      categoryId: req.query.categoryId || null,
      page,
      limit,
      includeInactive: req.query.includeInactive === 'true'
    });

    return res.json({
      success: true,
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  let uploadedImageUrl = null;
  try {
    const payload = normalizeProductPayload(req.body);
    if (req.body.imageBase64) {
      uploadedImageUrl = await saveBase64Image(req.body.imageBase64);
      payload.imageUrl = uploadedImageUrl;
    }

    const productId = await Product.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Product created',
      data: await Product.findById(productId)
    });
  } catch (error) {
    if (uploadedImageUrl) {
      await removeLocalImage(uploadedImageUrl);
    }
    if (isDuplicateProductNameError(error)) {
      return res.status(400).json({
        success: false,
        message: 'Product name already exists in this category'
      });
    }
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const payload = normalizeProductPayload(req.body);
    payload.imageUrl = existing.image_url;
    let uploadedImageUrl = null;

    if (req.body.imageBase64) {
      uploadedImageUrl = await saveBase64Image(req.body.imageBase64);
      payload.imageUrl = uploadedImageUrl;
    }

    try {
      await Product.update(req.params.id, payload);
    } catch (error) {
      if (uploadedImageUrl) {
        await removeLocalImage(uploadedImageUrl);
      }
      throw error;
    }

    if (uploadedImageUrl && existing.image_url && existing.image_url !== uploadedImageUrl) {
      await removeLocalImage(existing.image_url);
    }

    return res.json({
      success: true,
      message: 'Product updated',
      data: await Product.findById(req.params.id)
    });
  } catch (error) {
    if (isDuplicateProductNameError(error)) {
      return res.status(400).json({
        success: false,
        message: 'Product name already exists in this category'
      });
    }
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    await Product.remove(req.params.id);
    if (existing.image_url) {
      await removeLocalImage(existing.image_url);
    }
    return res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product linked to orders'
      });
    }
    return next(error);
  }
}

async function updateStock(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { quantity, changeType } = req.body;
    if ((changeType === 'add' || changeType === 'remove') && quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }
    let nextStock = product.stock;
    if (changeType === 'add') {
      nextStock = product.stock + quantity;
    } else if (changeType === 'remove') {
      nextStock = product.stock - quantity;
    } else {
      nextStock = quantity;
    }

    if (nextStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    await Product.updateStock(req.params.id, nextStock);
    await InventoryLog.create({
      productId: req.params.id,
      changeType,
      quantityChanged: quantity,
      note: `Stock changed by admin ${req.admin.id}`
    });

    return res.json({
      success: true,
      message: 'Stock updated',
      data: await Product.findById(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};


