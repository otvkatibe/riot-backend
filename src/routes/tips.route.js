import { Router } from 'express';
const router = Router();

const tips = [
  "Sempre compre wards! A visão é crucial para evitar ganks e controlar objetivos importantes como Dragão e Barão.",
  "Aprenda a fazer last hit nos minions. Apenas eliminar o minion no último momento garante o ouro máximo.",
  "Mantenha o mapa sempre visível. Olhe para o minimapa a cada 3-5 segundos para ter consciência situacional.",
  "Controle as ondas de minions. Saber quando empurrar ou congelar a lane pode determinar o resultado do jogo.",
  "Coordene com seu time para objetivos. Dragões e Barão podem virar completamente uma partida.",
  "Builds são situacionais. Adapte seus itens baseado na composição inimiga e no estado do jogo.",
  "Aprenda os tempos de respawn dos camps da jungle. Isso ajuda no controle de território e farm eficiente.",
  "Use pings para comunicar com o time. Comunicação clara é essencial, mesmo sem chat de voz.",
  "Gerencie seu mana/energia. Ficar sem recursos no momento errado pode custar kills ou objetivos.",
  "Pratique combos de habilidades no Practice Tool. Muscle memory é fundamental em situações de pressão.",
  "Observe as builds dos profissionais, mas entenda o porquê de cada escolha antes de copiar.",
  "Aprenda a fazer roaming no momento certo. Ajudar outras lanes pode acelerar sua vantagem no jogo.",
  "Controle seu tilt. Manter a calma e foco é mais importante que habilidade mecânica em muitos casos.",
  "Estude os power spikes dos campeões. Saber quando você é forte ou fraco define suas jogadas.",
  "Sempre tenha um plano de escape. Posicionamento é tão importante quanto saber atacar.",
  "Use o recall estrategicamente. Voltar na base no momento certo pode dar vantagem significativa na lane.",
  "Aprenda a calcular dano. Saber se consegue matar o oponente evita trades ruins.",
  "Gerencie as waves antes de objectives. Minions podem decidir se você consegue contestar ou não.",
  "Pratique diferentes campeões em cada role. Versatilidade te torna um jogador mais completo.",
  "Analise suas replays. Identificar erros próprios é a forma mais rápida de melhorar no jogo."
];

router.get('/', (req, res) => {
  const randomIndex = Math.floor(Math.random() * tips.length);
  res.json({ tip: tips[randomIndex] });
});

export default router; 