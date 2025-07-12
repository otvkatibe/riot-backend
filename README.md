# 🎮 Riot Backend API

Uma API REST para consulta de dados do League of Legends com sistema de favoritos, autenticação de usuários e cache inteligente.

## 👥 Criadores

Este projeto foi desenvolvido como trabalho da disciplina **Desenvolvimento Full-Stack** pelos seguintes desenvolvedores:

- **Otávio Katibe** - [@otvkatibe](https://github.com/otvkatibe)
- **Vitor Lucena** - [@vitorlucena1](https://github.com/vitorlucena1)  
- **Charles Moese** - [@charlesmoese](https://github.com/charlesmoese)
- **Maria Eduarda Rocha** - [@rocha-duda](https://github.com/rocha-duda)

---

## 📋 Funcionalidades

### 🔐 Autenticação
- Registro de usuários com validação de email e senha
- Login com JWT para autenticação
- Middleware de proteção de rotas
- Endpoint para dados do usuário autenticado

### 🎯 API Riot Games
- Busca de dados de jogadores por nome e tag
- Consulta de maestrias de campeões (top 10)
- Estatísticas de winrate em ranqueada
- Perfil completo do jogador (rank, nível, ícone)
- Estatísticas específicas por campeão
- Busca do top 3 de jogadores do elo Desafiante
- Histórico de partidas recentes (últimas 20 partidas)
- Lista completa de campeões do jogo
- Detalhes específicos de campeões

### ⭐ Sistema de Favoritos
- Adicionar jogadores aos favoritos
- Listar favoritos do usuário
- Atualizar observações dos favoritos
- Remover favoritos
- Cache inteligente para favoritos

### ⚡ Sistema de Cache Inteligente
- Cache automático de todas as consultas da API Riot
- Diferentes tempos de cache por tipo de dados
- Reduz drasticamente o uso de rate limits (70-80% menos requisições)
- Estatísticas de performance e saúde do cache
- Limpeza seletiva e warmup de cache
- Cache expirado automaticamente pelo MongoDB
- Monitoramento de hit/miss ratio nos logs

### 📊 Endpoints de Cache
- `GET /cache/stats` - Estatísticas detalhadas do cache
- `GET /cache/health` - Saúde do sistema de cache  
- `DELETE /cache/clear` - Limpar cache (opcional: por tipo/padrão)
- `POST /cache/warmup` - Pré-aquecer cache com endpoints comuns

### 🕐 Tempos de Cache
- **Perfil**: 15 minutos
- **Maestria**: 60 minutos  
- **Winrate**: 10 minutos
- **Champion Stats**: 30 minutos
- **Histórico**: 5 minutos
- **Lista de Campeões**: 24 horas
- **Challenger**: 30 minutos
- **PUUID**: 60 minutos
- **Favoritos**: Cache padrão (15 minutos)

### 📚 Documentação
- API documentada com Swagger
- Endpoint `/docs` para interface interativa
- Endpoint `/swagger.json` para especificação

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas
- **Swagger** - Documentação da API
- **Jest** - Framework de testes
- **node-fetch** - Cliente HTTP para API externa

## 📁 Estrutura do Projeto

```
src/
├── controller/          # Controladores das rotas
│   ├── cache.controller.js       # Gerenciamento do cache
│   ├── favorite.controller.js    # Sistema de favoritos
│   ├── riot.controller.js        # API Riot Games
│   └── user.controller.js        # Autenticação de usuários
├── database/           # Configuração do banco
│   └── configdb.js
├── middlewares/        # Middlewares de validação e cache
│   ├── cache.middleware.js       # Middleware de cache inteligente
│   ├── jwt.token.middleware.js   # Autenticação JWT
│   └── riot.validation.js        # Validações da API Riot
├── models/            # Modelos do MongoDB
│   ├── Cache.js                  # Modelo do cache
│   ├── FavoriteRiot.js          # Modelo dos favoritos
│   └── User.js                   # Modelo dos usuários
├── routes/            # Definição das rotas
│   ├── cache.route.js           # Rotas do cache
│   ├── favorite.riot.route.js   # Rotas dos favoritos
│   ├── riot.route.js            # Rotas da API Riot
│   └── user.route.js            # Rotas dos usuários
├── services/          # Lógica de negócio
│   ├── cache.service.js         # Serviços do cache
│   ├── favorite.riot.service.js # Serviços dos favoritos
│   ├── riot.service.js          # Serviços da API Riot
│   └── user.service.js          # Serviços dos usuários
├── tests/             # Testes automatizados
├── utils/             # Utilitários
│   ├── response.js
│   └── validation.js
├── index.js           # Arquivo principal
└── swagger.js         # Configuração do Swagger
```

## ⚙️ Configuração

### Pré-requisitos
- Node.js 16+
- MongoDB
- Conta na Riot Games Developer Portal

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGODB_URL=mongodb://localhost:27017
DB_NAME=riot_backend
JWT_SECRET=seu_jwt_secret_aqui
RIOT_API_KEY=sua_chave_da_riot_api
```

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd riot-backend

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

## 📊 Endpoints da API

### 👤 Usuários

#### POST `/user/register`
Registra um novo usuário.

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### POST `/user/login`
Autentica um usuário.

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### GET `/user/me`
Retorna dados do usuário autenticado (requer token).

### 🎮 Riot API

#### GET `/riot/puuid`
Busca o PUUID de um jogador.
- Parâmetros: `nome`, `tag`
- Cache: 60 minutos

#### GET `/riot/profile`
Perfil completo do jogador.
- Parâmetros: `puuid`
- Cache: 15 minutos

#### GET `/riot/maestria`
Top 10 maestrias do jogador.
- Parâmetros: `nome`, `tag`
- Cache: 60 minutos

#### GET `/riot/winrate`
Taxa de vitórias do jogador em ranqueada.
- Parâmetros: `nome`, `tag`
- Cache: 10 minutos

#### GET `/riot/champion-stats`
Estatísticas com um campeão específico.
- Parâmetros: `nome`, `tag`, `champion`
- Cache: 30 minutos

#### GET `/riot/history`
Busca o histórico de partidas recentes de um jogador.
- Parâmetros: `nome`, `tag`
- Cache: 5 minutos

#### GET `/riot/challenger-top3`
Busca o top 3 de jogadores do elo Desafiante (Solo/Duo).
- Parâmetros: Nenhum
- Cache: 30 minutos

#### GET `/riot/champions`
Lista completa de campeões do League of Legends.
- Parâmetros: Nenhum
- Cache: 24 horas

#### GET `/riot/champions/:id`
Detalhes específicos de um campeão.
- Parâmetros: `id` (ID do campeão)
- Cache: 24 horas

### ⭐ Favoritos (Requer autenticação)

#### POST `/riot/favorites`
Adiciona um favorito.

```json
{
  "nome": "Faker",
  "tag": "T1",
  "tipo": "player",
  "observacao": "Melhor mid laner"
}
```

#### GET `/riot/favorites`
Lista todos os favoritos do usuário.
- Cache: 15 minutos

#### PUT `/riot/favorites/:id`
Atualiza um favorito.

#### DELETE `/riot/favorites/:id`
Remove um favorito.

### ⚡ Cache Management

#### GET `/cache/stats`
Estatísticas detalhadas do cache.

```json
{
  "totalEntries": 150,
  "expiredEntries": 12,
  "byType": [
    {
      "_id": "profile",
      "count": 45,
      "totalSize": 2048576
    }
  ]
}
```

#### GET `/cache/health`
Saúde do sistema de cache.

```json
{
  "status": "healthy",
  "totalEntries": 150,
  "recentEntries": 23,
  "expiredEntries": 5,
  "timestamp": "2024-07-12T15:30:00.000Z"
}
```

#### DELETE `/cache/clear`
Limpa o cache.
- Query params opcionais: `type`, `pattern`

```bash
# Limpar cache específico
curl -X DELETE "http://localhost:3000/cache/clear?type=profile"

# Limpar por padrão
curl -X DELETE "http://localhost:3000/cache/clear?pattern=faker"

# Limpar todo o cache
curl -X DELETE "http://localhost:3000/cache/clear"
```

#### POST `/cache/warmup`
Pré-aquece o cache com endpoints comuns.

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

### Cobertura de Testes

- ✅ Controllers (User, Riot, Favorite, Cache)
- ✅ Services (User, Riot, Favorite, Cache)
- ✅ Middlewares (JWT, Validações, Cache)
- ✅ Rotas
- ✅ Utilitários
- ✅ Modelos

## 📖 Documentação

Acesse a documentação interativa em: `http://localhost:3000/docs`

Ou baixe o JSON do Swagger em: `http://localhost:3000/swagger.json`

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 🛡️ Validações

### Email
- Formato válido de email
- Único no sistema

### Senha
- Mínimo de 8 caracteres
- Hash com bcrypt

### Parâmetros Riot
- Nome e tag obrigatórios
- PUUID validado
- Campeão existente

## 🎯 Exemplos de Uso

### Buscar perfil de um jogador
```bash
curl "http://localhost:3000/riot/profile?puuid=PUUID_DO_JOGADOR"
```

### Adicionar jogador aos favoritos
```bash
curl -X POST "http://localhost:3000/riot/favorites" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Faker",
    "tag": "T1", 
    "tipo": "player",
    "observacao": "GOAT"
  }'
```

### Verificar estatísticas do cache
```bash
curl "http://localhost:3000/cache/stats"
```

### Limpar cache específico
```bash
curl -X DELETE "http://localhost:3000/cache/clear?type=winrate"
```

## ⚡ Performance e Cache

### Benefícios do Sistema de Cache

- **💰 Economia de API calls**: Reduz 70-80% das requisições à API da Riot
- **⚡ Performance**: Respostas 10x mais rápidas em cache hits
- **🛡️ Rate Limiting**: Proteção contra limites da API
- **📊 Monitoramento**: Estatísticas detalhadas de uso
- **🔧 Flexibilidade**: Tempos configuráveis por tipo de dados

### Logs de Cache

O sistema registra hits e misses no console:

```
🎯 Cache HIT para /riot/profile:{"puuid":"123"}
❌ Cache MISS para /riot/winrate:{"nome":"faker","tag":"t1"}
Cache SET: /riot/maestria:{"nome":"caps","tag":"g2"} (maestria) - expira em 60min
```

## 🚨 Tratamento de Erros

A API retorna códigos HTTP apropriados:

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Token inválido
- `404` - Recurso não encontrado
- `409` - Conflito (duplicata)
- `500` - Erro interno

## 🔧 Configurações Avançadas

### Tempos de Cache Personalizados

Para ajustar os tempos de cache, edite `/src/services/cache.service.js`:

```javascript
const CACHE_TIMES = {
  profile: 15,        // 15 minutos
  maestria: 60,       // 1 hora
  winrate: 10,        // 10 minutos
  // ... outros tipos
};
```

### Limpeza Automática

O MongoDB remove automaticamente entradas expiradas usando TTL indexes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📈 Roadmap

- [ ] Análise avançada de performance de jogadores
- [ ] Sistema de notificações para mudanças de rank
- [ ] Comparação entre jogadores
- [ ] Dashboard de estatísticas
- [ ] API para times e torneios

---

⚡ **Desenvolvido para a comunidade League of Legends com foco em performance e escalabilidade** ⚡
