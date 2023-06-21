require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware rate-limit
const limiter = rateLimit({
  windowMs: 30 * 1000, // 30 segundos
  max: 5, // 5 requisições no máximo
  message: 'Limite de requisições excedido. Por favor, tente novamente mais tarde.',
});

app.use(bodyParser.json());

// Aplicar o middleware rate-limit às rotas desejadas
app.use('/webhook', limiter);

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Webhook está ouvindo na porta ${PORT}`);
});
