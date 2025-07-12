import express from 'express';
import { 
  getCacheStatsEndpoint, 
  clearCacheEndpoint, 
  warmupCache,
  getCacheHealth 
} from '../controller/cache.controller.js';

const router = express.Router();

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Estatísticas detalhadas do cache
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Estatísticas do cache
 */
router.get('/stats', getCacheStatsEndpoint);

/**
 * @swagger
 * /cache/health:
 *   get:
 *     summary: Saúde do sistema de cache
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Status de saúde do cache
 */
router.get('/health', getCacheHealth);

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Limpa o cache
 *     tags: [Cache]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [profile, maestria, winrate, champion-stats, matches, champions, challenger, puuid]
 *         description: Tipo específico de cache para limpar
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *         description: Padrão para filtrar chaves
 *     responses:
 *       200:
 *         description: Cache limpo com sucesso
 */
router.delete('/clear', clearCacheEndpoint);

/**
 * @swagger
 * /cache/warmup:
 *   post:
 *     summary: Pré-aquece o cache com endpoints comuns
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Warmup iniciado com sucesso
 */
router.post('/warmup', warmupCache);

export default router;