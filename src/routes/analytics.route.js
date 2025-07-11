import express from 'express';
import { getAnalytics, getCacheStatus, getPlayerInsights } from '../controller/analytics.controller.js';

const router = express.Router();

/**
 * @swagger
 * /analytics/community:
 *   get:
 *     summary: Retorna analytics da comunidade com estatísticas interessantes
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics da comunidade gerados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityAnalytics'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/community', getAnalytics);

/**
 * @swagger
 * /analytics/cache-status:
 *   get:
 *     summary: Retorna estatísticas do sistema de cache
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Status do cache recuperado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CacheStatus'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/cache-status', getCacheStatus);

/**
 * @swagger
 * /analytics/player:
 *   get:
 *     summary: Retorna insights específicos de um jogador
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome do jogador
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *         description: Tag do jogador
 *     responses:
 *       200:
 *         description: Insights do jogador recuperados com sucesso
 *       400:
 *         description: Parâmetros obrigatórios faltando
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/player', getPlayerInsights);

export default router;