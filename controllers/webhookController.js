const request = require('request');
const createInternalRequestOptions = require('../services/internalRequestOptions');

function handleWebhookRequest(req, res) {
  const { cnpj_cpf, data_nascimento } = req.body;
  const options = createInternalRequestOptions(cnpj_cpf);

  performInternalRequest(options, (error, response, body) => {
    if (error) {
      handleInternalRequestError(res);
    } else {
      handleInternalResponse(body, data_nascimento, res);
    }
  });
}

function performInternalRequest(options, callback) {
  request(options, callback);
}

function handleInternalRequestError(res) {
  res.status(500).json({ error: 'Erro na consulta interna.' });
}

function handleInternalResponse(body, data_nascimento, res) {
  if (body && body.registros && body.registros.length > 0) {
    const registro = body.registros[0];
    if (registro.data_nascimento === data_nascimento) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } else {
    res.status(404).json({ error: 'Registro não encontrado.' });
  }
}

module.exports = {
  handleWebhookRequest
};
