// Controller: handles API request/response flow for categoryController features.

const Category = require('../models/Category');

async function getCategories(req, res, next) {
  try {
    const categories = await Category.getAll();
    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const id = await Category.create(req.body);
    const category = await Category.findById(id);
    return res.status(201).json({
      success: true,
      message: 'Category created',
      data: category
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await Category.update(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Category updated',
      data: await Category.findById(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await Category.remove(req.params.id);
    return res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category linked to products'
      });
    }
    return next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};


