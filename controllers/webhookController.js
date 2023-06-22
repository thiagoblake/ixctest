const request = require('request');
const createInternalRequestOptions = require('../services/internalRequestOptions');
const svgCaptcha = require('svg-captcha');

function handleWebhookRequest(req, res) {
  const { cnpj_cpf, data_nascimento, hotsite_email, senha, captcha } = req.body;

  // Verifica se o captcha é obrigatório e se foi fornecido
  if (isCaptchaRequired(req) && !captcha) {
    return res.status(400).json({ error: 'O captcha é obrigatório.' });
  }

  // Verifica se o captcha fornecido é válido
  if (isCaptchaRequired(req) && !validateCaptcha(req.session, captcha)) {
    return res.status(400).json({ error: 'Captcha inválido.' });
  }

  const options = createInternalRequestOptions(cnpj_cpf);

  performInternalRequest(options, (error, response, body) => {
    if (error) {
      handleInternalRequestError(res);
    } else {
      handleInternalResponse(body, data_nascimento, hotsite_email, senha, res);
    }
  });
}

function isCaptchaRequired(req) {
  // Adicione sua lógica para determinar se o captcha é obrigatório ou não
  // Por exemplo, você pode verificar se o usuário está em uma lista de IPs confiáveis, se já atingiu um limite de requisições, etc.
  return true; // Altere para retornar true ou false com base na sua lógica
}

function validateCaptcha(session, userCaptcha) {
  const validCaptcha = session.captcha; // Captcha gerado e armazenado na sessão
  return userCaptcha === validCaptcha;
}

function performInternalRequest(options, callback) {
  request(options, callback);
}

function handleInternalRequestError(res) {
  res.status(500).json({ error: 'Erro na consulta interna.' });
}

function handleInternalResponse(body, data_nascimento, hotsite_email, senha, res) {
  if (body && body.registros && body.registros.length > 0) {
    const registro = body.registros[0];
    if (registro.data_nascimento === data_nascimento) {
      editUser(registro, hotsite_email, senha); // Chama a função editUser para realizar a edição do usuário
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } else {
    res.status(404).json({ error: 'Registro não encontrado.' });
  }
}

function editUser(registro, hotsite_email, senha) {
  const token = process.env.TOKEN;
  const url = `${process.env.URL}/${registro.id}`;

  const options = {
    method: 'PUT',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
    },
    body: {
      ...registro, // Manter todos os dados existentes
      hotsite_email: hotsite_email, // Novo valor para o campo hotsite_email
      senha: senha, // Novo valor para o campo senha
      data_nascimento: convertDataNascimento(registro.data_nascimento), // Convertendo para o formato dd/mm/yyyy
    },
    json: true,
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
}

function convertDataNascimento(data_nascimento) {
  // Converte a data_nascimento para o formato dd/mm/yyyy
  const [year, month, day] = data_nascimento.split('-');
  return `${day}/${month}/${year}`;
}

function getCaptchaData(req, res) {
  const captchaData = generateCaptcha(req.session);
  res.type('svg').send(captchaData);
}

module.exports = {
  handleWebhookRequest,
  getCaptchaData
};

