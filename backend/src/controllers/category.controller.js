import { Category } from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl } = req.body;

  // Validate required fields
  if (!name || !description) {
    throw new ApiError(400, 'Name and description are required');
  }

  // Get the user id from req.user (set by your auth middleware)
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Check if the user already has a category with this name
  const existingCategory = await Category.findOne({ name, createdBy: userId });
  if (existingCategory) {
    throw new ApiError(400, 'Category already exists');
  }

  const category = await Category.create({ name, description, imageUrl, createdBy: userId });
  return res
    .status(201)
    .json(new ApiResponse(201, category, 'Category created successfully'));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ createdBy: req.query.createdBy }).populate('createdBy','username').sort({ createdAt: -1 });
  if (!categories || categories.length === 0) {
    throw new ApiError(404, 'No categories found');
  }
  return res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate('createdBy', 'username profilePicture');
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return res.status(200).json(new ApiResponse(200, category, 'Category fetched successfully'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, imageUrl },
    { new: true, runValidators: true }
  );
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return res.status(200).json(new ApiResponse(200, category, 'Category deleted successfully'));
});