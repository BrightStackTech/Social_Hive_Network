import { Router } from 'express';
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory); // <-- new route to get a single category
router.put('/:id', verifyJWT, updateCategory);
router.delete('/:id', verifyJWT, deleteCategory); 

export default router;