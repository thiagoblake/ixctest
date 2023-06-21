const process = require('process');

const createInternalRequestOptions = (cnpj_cpf) => {
  const token = process.env.TOKEN;
  const url = process.env.URL;

  return {
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
      ixcsoft: 'listar'
    },
    body: {
      qtype: 'cliente.cnpj_cpf',
      query: cnpj_cpf,
      oper: '=',
    },
    json: true
  };
};

module.exports = createInternalRequestOptions;
