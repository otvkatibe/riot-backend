# 🎮 Riot Backend API

Uma API REST para consulta de dados do League of Legends com sistema de favoritos, autenticação e **cache inteligente**.

## 👥 Criadores

Trabalho da disciplina **Desenvolvimento Full-Stack**:

- **Otávio Katibe** - [@otvkatibe](https://github.com/otvkatibe)
- **Vitor Lucena** - [@vitorlucena1](https://github.com/vitorlucena1)  
- **Charles Moese** - [@charlesmoese](https://github.com/charlesmoese)
- **Maria Eduarda Rocha** - [@rocha-duda](https://github.com/rocha-duda)

---

## ⚡ Quick Start

```bash
# Clone e instale
git clone <url-do-repositorio>
cd riot-backend
npm install

# Configure .env
PORT=3000
MONGODB_URL=mongodb://localhost:27017
DB_NAME=riot_backend
JWT_SECRET=seu_jwt_secret_aqui
RIOT_API_KEY=sua_chave_da_riot_api

# Execute
npm start
```

📚 **Documentação completa:** `http://localhost:3000/docs`

## 🚀 Principais Features

### 🔐 **Autenticação JWT**
- Registro e login de usuários
- Proteção de rotas sensíveis

### 🎯 **API Riot Games**
- Perfil de jogadores (rank, level, ícone)
- Maestrias de campeões (top 10)
- Winrate e estatísticas detalhadas
- Histórico de partidas
- **Top 3 Challenger** (atualizado a cada hora)

### ⭐ **Sistema de Favoritos**
- Salvar jogadores favoritos
- Adicionar observações pessoais
- CRUD completo com autenticação

### 📊 **Cache Inteligente + Analytics** ✨
- **Cache automático** reduz 90% das requisições à Riot API
- **Analytics da comunidade** baseados em dados coletados
- **Insights únicos** de popularidade e tendências

## 📊 Endpoints Principais

| Endpoint | Descrição | Autenticação |
|----------|-----------|--------------|
| `POST /user/register` | Criar conta | ❌ |
| `POST /user/login` | Fazer login | ❌ |
| `GET /riot/profile?puuid=X` | Perfil do jogador | ❌ |
| `GET /riot/maestria?nome=X&tag=Y` | Top 10 maestrias | ❌ |
| `GET /riot/challenger-top3` | Top 3 Challenger ⚡ | ❌ |
| `POST /riot/favorites` | Adicionar favorito | ✅ |
| `GET /analytics/community` | Stats comunidade ✨ | ❌ |

## 🎯 Diferenciais

### 💡 **Cache Inteligente**
```javascript
// Primeira consulta: API da Riot (lenta)
GET /riot/profile?puuid=abc123
// Próximas consultas: Cache (instantâneo)
```

### 📈 **Analytics Únicos**
```javascript
GET /analytics/community
{
  "jogadoresMaisBuscados": [
    {"jogador": "Faker#T1", "consultas": 47},
    {"jogador": "Caps#G2", "consultas": 31}
  ],
  "estatisticasGerais": {
    "totalConsultas": 1247,
    "jogadoresUnicos": 89
  }
}
```

## 🧪 Testes

```bash
npm test                    # Todos os testes
npm run test:coverage       # Com coverage
```

## 🛠️ Stack

**Backend:** Node.js + Express + MongoDB  
**Auth:** JWT  
**API:** Riot Games API  
**Docs:** Swagger  
**Tests:** Jest  
**Cache:** MongoDB TTL + Analytics

## 📖 Documentação

- **API Docs:** `http://localhost:3000/docs`
- **Analytics:** `http://localhost:3000/analytics/community`
- **Cache Status:** `http://localhost:3000/analytics/cache-status`

## 🤝 Contribuição

1. Fork → Branch → Commit → PR
2. Execute os testes antes do commit
3. Mantenha o padrão de código

---

⚡ **API para a comunidade League of Legends** ⚡
