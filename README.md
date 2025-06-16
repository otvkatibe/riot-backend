# 🎮 Riot Backend API

Uma API REST para consulta de dados do League of Legends com sistema de favoritos e autenticação de usuários.

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

### 🎯 API Riot Games
- Busca de dados de jogadores por nome e tag
- Consulta de maestrias de campeões
- Estatísticas de winrate
- Perfil completo do jogador (rank, nível, ícone)
- Estatísticas específicas por campeão

### ⭐ Sistema de Favoritos
- Adicionar jogadores aos favoritos
- Listar favoritos do usuário
- Atualizar observações
- Remover favoritos

### 📚 Documentação
- API documentada com Swagger
- Endpoint `/docs` para interface interativa

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
│   ├── favorite.controller.js
│   ├── riot.controller.js
│   └── user.controller.js
├── database/           # Configuração do banco
│   └── configdb.js
├── middlewares/        # Middlewares de validação
│   ├── jwt.token.middleware.js
│   └── riot.validation.js
├── models/            # Modelos do MongoDB
│   ├── FavoriteRiot.js
│   └── User.js
├── routes/            # Definição das rotas
│   ├── favorite.riot.route.js
│   ├── riot.route.js
│   └── user.route.js
├── services/          # Lógica de negócio
│   ├── favorite.riot.service.js
│   ├── riot.service.js
│   └── user.service.js
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

### 🎮 Riot API

#### GET `/riot/puuid`
Busca o PUUID de um jogador.
- Parâmetros: `nome`, `tag`

#### GET `/riot/profile`
Perfil completo do jogador.
- Parâmetros: `puuid`

#### GET `/riot/maestria`
Top 10 maestrias do jogador.
- Parâmetros: `nome`, `tag`

#### GET `/riot/winrate`
Taxa de vitórias do jogador.
- Parâmetros: `nome`, `tag`

#### GET `/riot/champion-stats`
Estatísticas com um campeão específico.
- Parâmetros: `nome`, `tag`, `champion`

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

#### PUT `/riot/favorites/:id`
Atualiza um favorito.

#### DELETE `/riot/favorites/:id`
Remove um favorito.

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

- ✅ Controllers (User, Riot, Favorite)
- ✅ Services (User, Riot, Favorite)
- ✅ Middlewares (JWT, Validações)
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

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

⚡ **Desenvolvido para a comunidade League of Legends** ⚡
