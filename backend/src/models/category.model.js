import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      // remove global unique constraint:
      // unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Category description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id is required'],
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);