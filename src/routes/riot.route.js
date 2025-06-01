import express from 'express';
import { getMaestria, getWinrate, getChampionStats, getProfile, getPuuid } from '../controller/riot.controller.js';
import { validateNomeTagChampion, validatePuuid, validateNomeTag } from '../middlewares/riot.validation.js';

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
router.get('/maestria', validateNomeTag, getMaestria);

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
router.get('/winrate', validateNomeTag, getWinrate);

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
router.get('/champion-stats', validateNomeTagChampion, getChampionStats);

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
router.get('/profile', validatePuuid, getProfile);

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
router.get('/puuid', validateNomeTag, getPuuid);

export default router;