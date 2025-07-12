import express from 'express';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import * as favoriteController from '../controller/favorite.controller.js';
import { cacheMiddleware } from '../middlewares/cache.middleware.js';

const router = express.Router();
router.use(verifyToken);

/**
 * @swagger
 * /riot/favorites:
 *   post:
 *     summary: Cria um favorito
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               tag:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [player, champion]
 *               observacao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorito criado
 */
router.post('/', favoriteController.createFavorite);

/**
 * @swagger
 * /riot/favorites:
 *   get:
 *     summary: Lista os favoritos do usuário autenticado
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 */
router.get('/', cacheMiddleware('favorites'), favoriteController.getFavorites);

/**
 * @swagger
 * /riot/favorites/{id}:
 *   put:
 *     summary: Atualiza um favorito
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorito atualizado
 *       404:
 *         description: Favorito não encontrado
 */
router.put('/:id', favoriteController.updateFavorite);

/**
 * @swagger
 * /riot/favorites/{id}:
 *   delete:
 *     summary: Remove um favorito
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorito removido
 *       404:
 *         description: Favorito não encontrado
 */
router.delete('/:id', favoriteController.deleteFavorite);

export default router;