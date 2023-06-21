require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const svgCaptcha = require('svg-captcha');
const session = require('express-session');
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

// Configuração do middleware de sessão
app.use(session({
  secret: 'aoba123',
  resave: false,
  saveUninitialized: true,
}));

// Aplicar o middleware rate-limit às rotas desejadas
app.use('/webhook', limiter);

// Rota para fornecer a imagem do captcha
app.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create();
  // Salva o valor do captcha gerado na sessão para posterior validação
  req.session.captcha = captcha.text;
  res.type('svg').send(captcha.data);
});

app.use(express.static('public'));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Webhook está ouvindo na porta ${PORT}`);
});
