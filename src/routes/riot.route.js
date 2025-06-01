import express from 'express';
import { getMaestria, getWinrate, getChampionStats, getProfile, getPuuid } from '../controller/riot.controller.js';
import { validateNomeTagChampion, validatePuuid, validateNomeTag } from '../middlewares/riot.validation.js';

const router = express.Router();

router.get('/maestria', validateNomeTag, getMaestria);
router.get('/winrate', validateNomeTag, getWinrate);
router.get('/champion-stats', validateNomeTagChampion, getChampionStats);
router.get('/profile', validatePuuid, getProfile);
router.get('/puuid', validateNomeTag, getPuuid);

export default router;