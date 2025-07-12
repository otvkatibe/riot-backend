import { clearCache, getCacheStats } from '../services/cache.service.js';
import Cache from '../models/Cache.js';

export const getCacheStatsEndpoint = async (req, res) => {
  try {
    const stats = await getCacheStats();
    
    if (!stats) {
      return res.status(500).json({ message: "Erro ao buscar estatísticas do cache." });
    }
    
    return res.status(200).json({
      ...stats,
      cacheHitInfo: "Verifique os logs do console para estatísticas detalhadas de HIT/MISS",
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cache:', error);
    return res.status(500).json({ message: "Erro ao buscar estatísticas do cache." });
  }
};

export const clearCacheEndpoint = async (req, res) => {
  try {
    const { type, pattern } = req.query;
    
    const deletedCount = await clearCache(pattern, type);
    
    return res.status(200).json({
      message: "Cache limpo com sucesso",
      deletedEntries: deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return res.status(500).json({ message: "Erro ao limpar cache." });
  }
};

export const warmupCache = async (req, res) => {
  try {
    // Lista de endpoints comuns para pré-aquecer o cache
    const commonEndpoints = [
      { path: '/riot/champions', type: 'champions' },
      { path: '/riot/challenger-top3', type: 'challenger' }
    ];
    
    const results = [];
    
    for (const endpoint of commonEndpoints) {
      try {
        // Aqui você faria as requisições para pré-aquecer
        // Por simplicidade, apenas registramos
        results.push({
          endpoint: endpoint.path,
          status: 'queued',
          type: endpoint.type
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.path,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return res.status(200).json({
      message: "Cache warmup iniciado",
      endpoints: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no warmup do cache:', error);
    return res.status(500).json({ message: "Erro no warmup do cache." });
  }
};

export const getCacheHealth = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEntries = await Cache.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });
    
    const expiredEntries = await Cache.countDocuments({
      expiresAt: { $lt: now }
    });
    
    const totalEntries = await Cache.countDocuments();
    
    const health = {
      status: 'healthy',
      totalEntries,
      recentEntries,
      expiredEntries,
      hitRatio: 'Consulte os logs para métricas detalhadas',
      timestamp: now.toISOString()
    };
    
    if (expiredEntries > totalEntries * 0.5) {
      health.status = 'warning';
      health.warning = 'Muitas entradas expiradas no cache';
    }
    
    return res.status(200).json(health);
  } catch (error) {
    console.error('Erro ao verificar saúde do cache:', error);
    return res.status(500).json({ 
      status: 'error',
      message: "Erro ao verificar saúde do cache.",
      timestamp: new Date().toISOString()
    });
  }
};