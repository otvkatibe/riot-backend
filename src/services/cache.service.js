import Cache from '../models/Cache.js';

// Tempos de cache em minutos
const CACHE_TIMES = {
  profile: 15,        // Perfil muda pouco
  maestria: 60,       // Maestria demora para mudar significativamente  
  winrate: 10,        // Winrate muda mais frequentemente
  'champion-stats': 30, // Estatísticas específicas de campeão
  matches: 5,         // Histórico de partidas muda mais rápido
  champions: 1440,    // Lista de campeões (24h - muda raramente)
  challenger: 30,     // Challenger muda com frequência
  puuid: 60          // PUUID raramente muda
};

export const getCachedData = async (key, cacheType) => {
  try {
    const cached = await Cache.findOne({ 
      key, 
      cacheType,
      expiresAt: { $gt: new Date() } 
    });
    
    return cached ? cached.data : null;
  } catch (error) {
    console.log('Erro ao buscar cache:', error);
    return null;
  }
};

export const setCachedData = async (key, data, cacheType) => {
  try {
    const cacheMinutes = CACHE_TIMES[cacheType] || 15;
    const expiresAt = new Date(Date.now() + cacheMinutes * 60 * 1000);
    
    await Cache.findOneAndUpdate(
      { key, cacheType },
      { data, expiresAt },
      { upsert: true, new: true }
    );
    
    console.log(`Cache SET: ${key} (${cacheType}) - expira em ${cacheMinutes}min`);
    return data;
  } catch (error) {
    console.log('Erro ao salvar cache:', error);
    return data; // Retorna os dados mesmo se falhar ao cachear
  }
};

export const clearCache = async (pattern = null, cacheType = null) => {
  try {
    const filter = {};
    
    if (pattern) {
      filter.key = { $regex: pattern, $options: 'i' };
    }
    
    if (cacheType) {
      filter.cacheType = cacheType;
    }
    
    const result = await Cache.deleteMany(filter);
    console.log(`Cache CLEARED: ${result.deletedCount} entries`);
    return result.deletedCount;
  } catch (error) {
    console.log('Erro ao limpar cache:', error);
    return 0;
  }
};

export const getCacheStats = async () => {
  try {
    const stats = await Cache.aggregate([
      {
        $group: {
          _id: '$cacheType',
          count: { $sum: 1 },
          totalSize: { $sum: { $bsonSize: '$data' } },
          oldestEntry: { $min: '$createdAt' },
          newestEntry: { $max: '$createdAt' }
        }
      }
    ]);
    
    const total = await Cache.countDocuments();
    const expired = await Cache.countDocuments({ expiresAt: { $lt: new Date() } });
    
    return {
      totalEntries: total,
      expiredEntries: expired,
      byType: stats
    };
  } catch (error) {
    console.log('Erro ao buscar estatísticas do cache:', error);
    return null;
  }
};