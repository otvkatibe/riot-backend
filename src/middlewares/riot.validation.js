export function validateNomeTagTipo(req, res, next) {
  const { nome, tag, tipo } = req.query;
  if (!nome || !tag || !tipo) {
    return res.status(400).json({ message: "Nome, tag e tipo são obrigatórios" });
  }
  next();
}

export function validateNomeTagChampion(req, res, next) {
  const { nome, tag, champion } = req.query;
  if (!nome || !tag || !champion) {
    return res.status(400).json({ message: "Parâmetros obrigatórios faltando" });
  }
  next();
}

export function validatePuuid(req, res, next) {
  const { puuid } = req.query;
  if (!puuid) {
    return res.status(400).json({ message: "PUUID é obrigatório" });
  }
  next();
}

export function validateNomeTag(req, res, next) {
  const { nome, tag } = req.query;
  if (!nome || !tag) {
    return res.status(400).json({ message: "Nome e tag são obrigatórios" });
  }
  next();
}

export const validateProfileParams = (req, res, next) => {
  const { nome, tag, puuid } = req.query;
  
  // Aceita PUUID (legado) OU nome+tag (moderno)
  if (!puuid && (!nome || !tag)) {
    return res.status(400).json({ 
      message: 'PUUID ou parâmetros nome e tag são obrigatórios' 
    });
  }
  
  next();
};