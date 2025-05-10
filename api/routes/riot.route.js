import express from 'express';
import { getMaestriaOuWinrate, getChampionStats, getProfile, getPuuid } from '../controller/riot.controller.js';
import { validateNomeTagTipo, validateNomeTagChampion, validatePuuid, validateNomeTag } from '../middlewares/riot.validation.js';

const router = express.Router();

router.get('/maestria-winrate', validateNomeTagTipo, getMaestriaOuWinrate);
router.get('/champion-stats', validateNomeTagChampion, getChampionStats);
router.get('/profile', validatePuuid, getProfile);
router.get('/puuid', validateNomeTag, getPuuid);

export default router;