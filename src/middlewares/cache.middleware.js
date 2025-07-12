import { getCachedData, setCachedData } from '../services/cache.service.js';

export const cacheMiddleware = (cacheType) => {
  return async (req, res, next) => {
    // Gera uma chave única baseada na rota e parâmetros
    const cacheKey = `${req.route?.path || req.path}:${JSON.stringify(req.query)}`;
    
    try {
      // Tenta buscar no cache primeiro
      const cachedData = await getCachedData(cacheKey, cacheType);
      
      if (cachedData) {
        console.log(`🎯 Cache HIT para ${cacheKey}`);
        return res.status(200).json(cachedData);
      }
      
      console.log(`❌ Cache MISS para ${cacheKey}`);
      
      // Se não encontrou no cache, intercepta a resposta
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(data) {
        handleCacheResponse(data, res.statusCode, cacheKey, cacheType);
        originalSend.call(this, data);
      };
      
      res.json = function(data) {
        handleCacheResponse(data, res.statusCode, cacheKey, cacheType);
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.log('Erro no middleware de cache:', error);
      next(); // Continua normalmente se der erro no cache
    }
  };
};

const handleCacheResponse = (data, statusCode, cacheKey, cacheType) => {
  // Se foi uma resposta de sucesso, salva no cache
  if (statusCode === 200) {
    setImmediate(async () => {
      try {
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        await setCachedData(cacheKey, jsonData, cacheType);
      } catch (error) {
        console.log('Erro ao salvar resposta no cache:', error);
      }
    });
  }
};

// Middleware específico para cache de longa duração
export const longCacheMiddleware = (cacheType, minutes = 1440) => {
  return async (req, res, next) => {
    const cacheKey = `${req.route?.path || req.path}:${JSON.stringify(req.query)}`;
    
    try {
      const cachedData = await getCachedData(cacheKey, cacheType);
      
      if (cachedData) {
        console.log(`🎯 Long Cache HIT para ${cacheKey}`);
        return res.status(200).json(cachedData);
      }
      
      console.log(`❌ Long Cache MISS para ${cacheKey}`);
      
      const originalJson = res.json;
      res.json = function(data) {
        if (res.statusCode === 200) {
          setImmediate(async () => {
            try {
              await setCachedData(cacheKey, data, cacheType);
            } catch (error) {
              console.log('Erro ao salvar no cache longo:', error);
            }
          });
        }
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.log('Erro no middleware de cache longo:', error);
      next();
    }
  };
};