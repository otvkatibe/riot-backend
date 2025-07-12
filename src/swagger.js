import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Riot Backend API',
      version: '1.0.0',
      description: 'API para consulta de dados do League of Legends com sistema de favoritos',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://riot-backend.vercel.app' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor de produção' 
          : 'Servidor de desenvolvimento',
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
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro',
            },
            error: {
              type: 'string',
              description: 'Detalhes do erro',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Usuário',
        description: 'Operações relacionadas a usuários',
      },
      {
        name: 'Riot',
        description: 'Consultas à API do League of Legends',
      },
      {
        name: 'Favoritos',
        description: 'Sistema de favoritos do usuário',
      },
      {
        name: 'Cache',
        description: 'Operações de cache',
      },
      {
        name: 'Tips',
        description: 'Sistema de dicas',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

// Configurações customizadas para o Swagger UI
const swaggerOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
  ],
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};

export { swaggerUi, swaggerSpec, swaggerOptions };