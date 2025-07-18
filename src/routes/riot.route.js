import express from 'express';
import { getMaestria, getWinrate, getChampionStats, getProfile, getPuuid, getChallengerTop3, getHistory, getChampionsList, getChampionDetail } from '../controller/riot.controller.js';
import { validateNomeTagChampion, validatePuuid, validateNomeTag } from '../middlewares/riot.validation.js';
import { cacheMiddleware, longCacheMiddleware } from '../middlewares/cache.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /riot/maestria:
 *   get:
 *     summary: Retorna as 10 maiores maestrias do jogador
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de maestrias
 */
router.get('/maestria', validateNomeTag, cacheMiddleware('maestria'), getMaestria);

/**
 * @swagger
 * /riot/winrate:
 *   get:
 *     summary: Retorna o winrate do jogador
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Winrate do jogador
 */
router.get('/winrate', validateNomeTag, cacheMiddleware('winrate'), getWinrate);

/**
 * @swagger
 * /riot/champion-stats:
 *   get:
 *     summary: Estatísticas do jogador com um campeão específico
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: champion
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Estatísticas do campeão
 */
router.get('/champion-stats', validateNomeTagChampion, cacheMiddleware('champion-stats'), getChampionStats);

/**
 * @swagger
 * /riot/profile:
 *   get:
 *     summary: Retorna o perfil do jogador
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: puuid
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Perfil do jogador
 */
router.get('/profile', validatePuuid, cacheMiddleware('profile'), getProfile);

/**
 * @swagger
 * /riot/puuid:
 *   get:
 *     summary: Retorna o PUUID do jogador
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: PUUID do jogador
 */
router.get('/puuid', validateNomeTag, cacheMiddleware('puuid'), getPuuid);

/**
 * @swagger
 * /riot/challenger-top3:
 *   get:
 *     summary: Retorna o top 3 de jogadores do elo Desafiante
 *     tags: [Riot]
 *     responses:
 *       200:
 *         description: Lista do top 3 de jogadores Desafiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   position:
 *                     type: number
 *                   name:
 *                     type: string
 *                   tag:
 *                     type: string
 *                   leaguePoints:
 *                     type: number
 *                   wins:
 *                     type: number
 *                   losses:
 *                     type: number
 *                   puuid:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/challenger-top3', longCacheMiddleware('challenger', 30), getChallengerTop3);

/**
 * @swagger
 * /riot/history:
 *   get:
 *     summary: Retorna o histórico geral recente do jogador (todas as partidas)
 *     tags: [Riot]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Histórico geral do jogador
 */
router.get('/history', validateNomeTag, cacheMiddleware('matches'), getHistory);

/**
 * @swagger
 * /riot/champions:
 *   get:
 *     summary: Retorna a lista de campeões
 *     tags: [Riot]
 *     responses:
 *       200:
 *         description: Lista de campeões
 */
router.get('/champions', longCacheMiddleware('champions', 1440), getChampionsList);

/**
 * @swagger
 * /riot/champions/{id}:
 *   get:
 *     summary: Retorna os detalhes de um campeão específico
 *     tags: [Riot]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Detalhes do campeão
 */
router.get('/champions/:id', longCacheMiddleware('champions', 1440), getChampionDetail);

export default router;