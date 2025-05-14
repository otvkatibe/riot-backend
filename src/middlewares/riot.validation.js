export function validateNomeTagTipo(req, res, next) {
  const { nome, tag, tipo } = req.query;
  if (!nome || !tag || !tipo) {
    return res.status(400).json({ error: "Nome, tag e tipo são obrigatórios" });
  }
  next();
}

export function validateNomeTagChampion(req, res, next) {
  const { nome, tag, champion } = req.query;
  if (!nome || !tag || !champion) {
    return res.status(400).json({ error: "Parâmetros obrigatórios faltando" });
  }
  next();
}

export function validatePuuid(req, res, next) {
  const { puuid } = req.query;
  if (!puuid) {
    return res.status(400).json({ error: "PUUID é obrigatório" });
  }
  next();
}

export function validateNomeTag(req, res, next) {
  const { nome, tag } = req.query;
  if (!nome || !tag) {
    return res.status(400).json({ error: "Nome e tag são obrigatórios" });
  }
  next();
}