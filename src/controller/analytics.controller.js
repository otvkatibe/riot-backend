import { getTopPlayersAnalytics, getCacheStats, getFromCache } from '../services/analytics.service.js';
import QueryCache from '../models/QueryCache.js';

export const getAnalytics = async (req, res) => {
  try {
    console.log('Gerando analytics da comunidade...');
    const analytics = await getTopPlayersAnalytics();
    
    res.json({
      success: true,
      message: 'Analytics da comunidade gerados com sucesso',
      data: analytics
    });

  } catch (error) {
    console.error('Erro ao gerar analytics:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar analytics da comunidade',
      error: error.message 
    });
  }
};

export const getCacheStatus = async (req, res) => {
  try {
    console.log('🔍 Verificando status do cache...');
    const cacheStats = await getCacheStats();
    
    res.json({
      success: true,
      message: 'Status do cache recuperado com sucesso',
      data: cacheStats
    });

  } catch (error) {
    console.error('Erro ao buscar status do cache:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar status do cache',
      error: error.message 
    });
  }
};

export const getPlayerInsights = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    
    if (!nome || !tag) {
      return res.status(400).json({ 
        message: 'Parâmetros obrigatórios: nome, tag' 
      });
    }

    const identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}`;
    
    const cacheEntries = await QueryCache.find({ 
      identificador: { $regex: identificador, $options: 'i' }
    }).sort({ ultimaConsulta: -1 });

    if (cacheEntries.length === 0) {
      return res.json({
        success: true,
        data: { 
          jogador: `${nome}#${tag}`,
          message: 'Nenhum dado encontrado para este jogador',
          disponivel: false 
        }
      });
    }

    const insights = {
      jogador: `${nome}#${tag}`,
      popularidade: {
        totalConsultas: cacheEntries.reduce((sum, cache) => sum + cache.totalConsultas, 0),
        primeiraConsulta: cacheEntries[cacheEntries.length - 1]?.createdAt,
        ultimaConsulta: cacheEntries[0]?.ultimaConsulta
      },
      dadosDisponiveis: cacheEntries.map(cache => ({
        tipo: cache.tipo,
        ultimaAtualizacao: cache.ultimaConsulta,
        consultas: cache.totalConsultas,
        expiresAt: cache.expiresAt
      }))
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar insights do jogador',
      error: error.message 
    });
  }
};