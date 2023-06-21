const request = require('request');
const createInternalRequestOptions = require('../services/internalRequestOptions');
const svgCaptcha = require('svg-captcha');

function handleWebhookRequest(req, res) {
  const { cnpj_cpf, data_nascimento, captcha } = req.body;

  // Verifica se o captcha fornecido é válido
  if (!validateCaptcha(req, captcha)) {
    return res.status(400).json({ error: 'Captcha inválido.' });
  }

  const options = createInternalRequestOptions(cnpj_cpf);

  performInternalRequest(options, (error, response, body) => {
    if (error) {
      handleInternalRequestError(res);
    } else {
      handleInternalResponse(body, data_nascimento, res);
    }
  });
}

function validateCaptcha(req, userCaptcha) {
  // Verifica se o captcha fornecido pelo usuário é igual ao captcha gerado anteriormente
  // Você pode ajustar essa lógica de validação de acordo com as suas necessidades
  const validCaptcha = req.session.captcha; // Captcha gerado e armazenado na sessão
  return userCaptcha === validCaptcha;
}

function generateCaptcha(req) {
  const captcha = svgCaptcha.create();
  // Salva o valor do captcha gerado na sessão para posterior validação
  req.session.captcha = captcha.text;
  return captcha.data;
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

function getCaptchaData(req, res) {
  const captchaData = generateCaptcha(req);
  res.type('svg').send(captchaData);
}

module.exports = {
  handleWebhookRequest,
  getCaptchaData
};
