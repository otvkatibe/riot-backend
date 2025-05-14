import express from 'express';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import * as favoriteController from '../controller/favoriteRiot.controller.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', favoriteController.createFavorite);
router.get('/', favoriteController.getFavorites);
router.put('/:id', favoriteController.updateFavorite);
router.delete('/:id', favoriteController.deleteFavorite);

export default router;