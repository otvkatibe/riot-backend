/**
 * Middleware para validar parâmetros nome, tag e tipo
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
export function validateNomeTagTipo(req, res, next) {
  const { nome, tag, tipo } = req.query;
  
  if (!nome || !tag || !tipo) {
    return res.status(400).json({ 
      error: "Nome, tag e tipo são obrigatórios",
      received: { nome: !!nome, tag: !!tag, tipo: !!tipo }
    });
  }
  
  // Validação adicional do tipo
  const validTypes = ['player', 'champion'];
  if (!validTypes.includes(tipo)) {
    return res.status(400).json({
      error: "Tipo deve ser 'player' ou 'champion'",
      received: tipo,
      validTypes
    });
  }
  
  next();
}

/**
 * Middleware para validar parâmetros nome, tag e champion
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function validateNomeTagChampion(req, res, next) {
  const { nome, tag, champion } = req.query;
  
  if (!nome || !tag || !champion) {
    return res.status(400).json({ 
      error: "Parâmetros obrigatórios faltando",
      required: ['nome', 'tag', 'champion'],
      received: { nome: !!nome, tag: !!tag, champion: !!champion }
    });
  }
  
  // Validação básica de formato
  if (nome.length < 1 || nome.length > 30) {
    return res.status(400).json({
      error: "Nome deve ter entre 1 e 30 caracteres",
      received: nome.length
    });
  }
  
  if (tag.length < 2 || tag.length > 10) {
    return res.status(400).json({
      error: "Tag deve ter entre 2 e 10 caracteres",
      received: tag.length
    });
  }
  
  next();
}

/**
 * Middleware para validar parâmetro PUUID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function validatePuuid(req, res, next) {
  const { puuid } = req.query;
  
  if (!puuid) {
    return res.status(400).json({ 
      error: "PUUID é obrigatório",
      hint: "Obtenha o PUUID através do endpoint /riot/puuid"
    });
  }
  
  // Validação básica do formato do PUUID
  if (typeof puuid !== 'string' || puuid.length < 10) {
    return res.status(400).json({
      error: "PUUID deve ser uma string válida",
      received: typeof puuid,
      length: puuid?.length
    });
  }
  
  next();
}

/**
 * Middleware para validar parâmetros nome e tag
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function validateNomeTag(req, res, next) {
  const { nome, tag } = req.query;
  
  if (!nome || !tag) {
    return res.status(400).json({ 
      error: "Nome e tag são obrigatórios",
      received: { nome: !!nome, tag: !!tag },
      example: "?nome=Faker&tag=T1"
    });
  }
  
  // Validação básica de formato
  if (nome.length < 1 || nome.length > 30) {
    return res.status(400).json({
      error: "Nome deve ter entre 1 e 30 caracteres",
      received: nome.length
    });
  }
  
  if (tag.length < 2 || tag.length > 10) {
    return res.status(400).json({
      error: "Tag deve ter entre 2 e 10 caracteres",
      received: tag.length
    });
  }
  
  next();
}

/**
 * Middleware para validar ID de parâmetro de rota
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function validateId(req, res, next) {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      error: "ID é obrigatório",
      hint: "ID deve ser fornecido na URL"
    });
  }
  
  // Validação básica para MongoDB ObjectId (24 caracteres hexadecimais)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return res.status(400).json({
      error: "ID deve ser um ObjectId válido",
      received: id,
      format: "24 caracteres hexadecimais"
    });
  }
  
  next();
}

/**
 * Middleware para validar dados de criação de favorito
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function validateFavoriteData(req, res, next) {
  const { nome, tag, tipo } = req.body;
  
  if (!nome || !tag || !tipo) {
    return res.status(400).json({
      error: "Nome, tag e tipo são obrigatórios no body",
      received: { nome: !!nome, tag: !!tag, tipo: !!tipo }
    });
  }
  
  const validTypes = ['player', 'champion'];
  if (!validTypes.includes(tipo)) {
    return res.status(400).json({
      error: "Tipo deve ser 'player' ou 'champion'",
      received: tipo,
      validTypes
    });
  }
  
  next();
}