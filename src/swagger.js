import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Riot Backend API',
      version: '3.1.0',
      description: 'API para consulta de dados do League of Legends com sistema de favoritos e cache inteligente',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://riot-backend.vercel.app/',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário',
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
          },
        },
        Rank: {
          type: 'object',
          properties: {
            tier: {
              type: 'string',
              description: 'Tier do rank (ex: SILVER, GOLD)',
            },
            rank: {
              type: 'string',
              description: 'Divisão do rank (ex: IV, III, II, I)',
            },
            leaguePoints: {
              type: 'number',
              description: 'Pontos de liga',
            },
            wins: {
              type: 'number',
              description: 'Número de vitórias',
            },
            losses: {
              type: 'number',
              description: 'Número de derrotas',
            },
            queueType: {
              type: 'string',
              description: 'Tipo da fila ranqueada',
            },
          },
        },
        Ranks: {
          type: 'object',
          properties: {
            soloDuo: {
              $ref: '#/components/schemas/Rank',
            },
            flex: {
              $ref: '#/components/schemas/Rank',
            },
          },
        },
        FavoriteRiot: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do favorito',
            },
            nome: {
              type: 'string',
              description: 'Nome do jogador/campeão',
            },
            tag: {
              type: 'string',
              description: 'Tag do jogador',
            },
            tipo: {
              type: 'string',
              enum: ['player', 'champion'],
              description: 'Tipo do favorito',
            },
            observacao: {
              type: 'string',
              description: 'Observação pessoal',
            },
            profileIconId: {
              type: 'number',
              description: 'ID do ícone do perfil',
            },
            summonerLevel: {
              type: 'number',
              description: 'Nível do invocador',
            },
            name: {
              type: 'string',
              description: 'Nome do invocador',
            },
            ranks: {
              $ref: '#/components/schemas/Ranks',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
          },
        },
        StandardResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
            },
            data: {
              type: 'object',
              description: 'Dados da resposta',
            },
            fromCache: {
              type: 'boolean',
              description: 'Indica se os dados vieram do cache',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp da resposta',
            },
          },
        },
        CommunityAnalytics: {
          type: 'object',
          properties: {
            jogadoresMaisBuscados: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  jogador: { type: 'string' },
                  consultas: { type: 'number' },
                  ultimaConsulta: { type: 'string', format: 'date-time' },
                },
              },
            },
            championsMaisConsultados: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campeao: { type: 'string' },
                  consultas: { type: 'number' },
                },
              },
            },
            estatisticasGerais: {
              type: 'object',
              properties: {
                totalConsultas: { type: 'number' },
                jogadoresUnicos: { type: 'number' },
                tiposConsulta: { type: 'number' },
              },
            },
            distribuicaoRanks: {
              type: 'array',
              description: 'Distribuição de ranks dos jogadores consultados',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'string', description: 'Tier do rank (IRON, BRONZE, SILVER, etc.)' },
                  jogadores: { type: 'number', description: 'Quantidade de jogadores neste rank' },
                  consultasTotal: { type: 'number', description: 'Total de consultas para este rank' },
                },
              },
            },
            horariosPopulares: {
              type: 'array',
              description: 'Horários com mais atividade (0-23h)',
              items: {
                type: 'object',
                properties: {
                  hora: { type: 'number', description: 'Hora do dia (0-23)' },
                  consultas: { type: 'number', description: 'Total de consultas neste horário' },
                  jogadoresUnicos: { type: 'number', description: 'Jogadores únicos consultados neste horário' },
                },
              },
            },
            geradoEm: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de quando os analytics foram gerados',
            },
          },
        },
        CacheStatus: {
          type: 'object',
          properties: {
            totalEntradas: {
              type: 'number',
              description: 'Total de entradas no cache',
            },
            estatisticas: {
              type: 'object',
              properties: {
                totalConsultas: { type: 'number' },
                totalEntradas: { type: 'number' },
              },
            },
            distribuicaoPorTipo: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  count: { type: 'number' },
                  totalConsultas: { type: 'number' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Usuário',
        description: 'Operações relacionadas a usuários (registro, login, perfil)',
      },
      {
        name: 'Riot',
        description: 'Consultas à API do League of Legends (perfis, maestrias, winrate, etc.)',
      },
      {
        name: 'Favoritos',
        description: 'Sistema de favoritos do usuário (CRUD completo)',
      },
      {
        name: 'Analytics',
        description: 'Sistema de cache inteligente e analytics da comunidade',
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controller/*.js',
  ],
};

let swaggerSpec;

try {
  swaggerSpec = swaggerJSDoc(options);
  console.log('Swagger spec gerado com sucesso');
  console.log('Paths encontrados:', Object.keys(swaggerSpec.paths || {}));
  console.log('Total de rotas documentadas:', Object.keys(swaggerSpec.paths || {}).length);
} catch (error) {
  console.error('Erro ao gerar swaggerSpec:', error);
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Riot Backend API - Erro',
      version: '1.0.0',
      description: 'Erro ao carregar documentação'
    },
    paths: {}
  };
}

export { swaggerUi, swaggerSpec };