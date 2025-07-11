import express from 'express';
import { getAnalytics, getCacheStatus, getPlayerInsights } from '../controller/analytics.controller.js';

const router = express.Router();

/**
 * @swagger
 * /analytics/community:
 *   get:
 *     summary: Analytics da comunidade
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Estatísticas da comunidade baseadas em cache
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jogadoresMaisBuscados:
 *                       type: array
 *                     championsMaisConsultados:
 *                       type: array
 *                     estatisticasGerais:
 *                       type: object
 */
router.get('/community', getAnalytics);

/**
 * @swagger
 * /analytics/cache-status:
 *   get:
 *     summary: Status do sistema de cache
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Estatísticas do cache
 */
router.get('/cache-status', getCacheStatus);

/**
 * @swagger
 * /analytics/player:
 *   get:
 *     summary: Insights de um jogador específico
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insights do jogador
 */
router.get('/player', getPlayerInsights);

export default router;