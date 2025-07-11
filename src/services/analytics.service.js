import QueryCache from '../models/QueryCache.js';
import FavoriteRiot from '../models/FavoriteRiot.js';

export const saveQueryToCache = async (tipo, identificador, dados, userId = null, customTTL = null) => {
  try {
    const existingCache = await QueryCache.findOne({ tipo, identificador });
    
    if (existingCache) {
      // Atualizar cache existente
      existingCache.dados = dados;
      existingCache.totalConsultas += 1;
      existingCache.ultimaConsulta = new Date();
      
      // TTL customizado ou padrão
      const ttlHours = customTTL || (process.env.CACHE_TTL_HOURS ? parseInt(process.env.CACHE_TTL_HOURS) : 24);
      existingCache.expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
      
      if (userId && !existingCache.consultadoPor.some(c => c.userId?.toString() === userId)) {
        existingCache.consultadoPor.push({ userId, timestamp: new Date() });
      }
      
      await existingCache.save();
      console.log(`Cache atualizado: ${tipo}/${identificador}`);
    } else {
      // Criar novo cache
      const ttlHours = customTTL || (process.env.CACHE_TTL_HOURS ? parseInt(process.env.CACHE_TTL_HOURS) : 24);
      
      await QueryCache.create({
        tipo,
        identificador,
        dados,
        consultadoPor: userId ? [{ userId, timestamp: new Date() }] : [],
        totalConsultas: 1,
        expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000)
      });
      console.log(`Novo cache criado: ${tipo}/${identificador}`);
    }
  } catch (error) {
    console.error('Erro ao salvar cache:', error.message);
  }
};

export const getFromCache = async (tipo, identificador) => {
  try {
    const cache = await QueryCache.findOne({ 
      tipo, 
      identificador,
      expiresAt: { $gt: new Date() }
    });
    
    if (cache) {
      console.log(`Cache hit: ${tipo}/${identificador}`);
      return cache.dados;
    }
    
    console.log(`💸 Cache miss: ${tipo}/${identificador}`);
    return null;
  } catch (error) {
    console.error('Erro ao buscar cache:', error.message);
    return null;
  }
};

export const getCacheStats = async () => {
  try {
    const [totalEntries, hitMissStats, typeDistribution] = await Promise.all([
      QueryCache.countDocuments({ expiresAt: { $gt: new Date() } }),
      
      QueryCache.aggregate([
        { $match: { expiresAt: { $gt: new Date() } } },
        { $group: {
          _id: null,
          totalConsultas: { $sum: '$totalConsultas' },
          totalEntradas: { $sum: 1 }
        }}
      ]),
      
      QueryCache.aggregate([
        { $match: { expiresAt: { $gt: new Date() } } },
        { $group: {
          _id: '$tipo',
          count: { $sum: 1 },
          totalConsultas: { $sum: '$totalConsultas' }
        }},
        { $sort: { totalConsultas: -1 } }
      ])
    ]);

    return {
      totalEntradas: totalEntries,
      estatisticas: hitMissStats[0] || { totalConsultas: 0, totalEntradas: 0 },
      distribuicaoPorTipo: typeDistribution,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Erro ao buscar estatísticas do cache: ${error.message}`);
  }
};

export const getTopPlayersAnalytics = async () => {
  try {
    const [
      jogadoresMaisBuscados,
      championsMaisConsultados,
      estatisticasGerais,
      jogadoresMaisFavoritados
    ] = await Promise.all([
      // Top 10 jogadores mais buscados
      QueryCache.aggregate([
        { $match: { tipo: { $in: ['profile', 'maestria', 'winrate'] } } },
        { $group: {
          _id: '$identificador',
          totalConsultas: { $sum: '$totalConsultas' },
          ultimaConsulta: { $max: '$ultimaConsulta' },
          dadosJogador: { $first: '$dados' }
        }},
        { $sort: { totalConsultas: -1 } },
        { $limit: 10 },
        { $project: {
          jogador: '$_id',
          consultas: '$totalConsultas',
          ultimaConsulta: '$ultimaConsulta',
          dados: '$dadosJogador'
        }}
      ]),

      // Top 10 campeões mais consultados
      QueryCache.aggregate([
        { $match: { tipo: 'champion-stats' } },
        { $group: {
          _id: '$dados.championName',
          totalConsultas: { $sum: '$totalConsultas' }
        }},
        { $sort: { totalConsultas: -1 } },
        { $limit: 10 },
        { $project: {
          campeao: '$_id',
          consultas: '$totalConsultas'
        }}
      ]),

      // Estatísticas gerais do sistema
      QueryCache.aggregate([
        { $group: {
          _id: null,
          totalConsultas: { $sum: '$totalConsultas' },
          jogadoresUnicos: { $addToSet: '$identificador' },
          tiposConsulta: { $addToSet: '$tipo' }
        }},
        { $project: {
          _id: 0,
          totalConsultas: 1,
          jogadoresUnicos: { $size: '$jogadoresUnicos' },
          tiposConsulta: { $size: '$tiposConsulta' }
        }}
      ]),

      // Top jogadores favoritados
      FavoriteRiot.aggregate([
        { $match: { tipo: 'player' } },
        { $group: {
          _id: { nome: '$nome', tag: '$tag' },
          totalFavoritos: { $sum: 1 }
        }},
        { $sort: { totalFavoritos: -1 } },
        { $limit: 10 },
        { $project: {
          jogador: { $concat: ['$_id.nome', '#', '$_id.tag'] },
          favoritos: '$totalFavoritos'
        }}
      ])
    ]);

    return {
      jogadoresMaisBuscados,
      championsMaisConsultados,
      estatisticasGerais: estatisticasGerais[0] || { totalConsultas: 0, jogadoresUnicos: 0, tiposConsulta: 0 },
      jogadoresMaisFavoritados,
      geradoEm: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Erro ao gerar analytics: ${error.message}`);
  }
};