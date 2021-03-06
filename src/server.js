const hapi = require('hapi');
const inert = require('inert');
const routes = require('./routes');
const vision = require('vision');
const Handlebars = require('handlebars');
const cookieAuth = require('hapi-auth-cookie');
const hapiAuth = require('hapi-auth-basic');
const credentials = require('hapi-context-credentials');
const fs = require('fs');

const server = new hapi.Server();

const port = process.env.PORT || 4000;

server.connection({
  port,
  tls: process.env.NODE_ENV !== 'production' && {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem'),
  },
  state: {
    isSameSite: 'Lax',
  },
});

server.register([inert, vision, hapiAuth, cookieAuth, credentials], (err) => {
  if (err) throw err;

  const options = {
    password: process.env.COOKIE_PASSWORD,
    cookie: 'logged-in',
    isSecure: false,
    ttl: 24 * 60 * 60 * 1000,
  };

  server.auth.strategy('base', 'cookie', 'optional', options);

  server.views({
    engines: { hbs: Handlebars },
    path: 'views',
    layout: 'default',
    layoutPath: 'views/layouts',
    partialsPath: 'views/partials',
    // helpersPath: 'views/helpers',
  });


  server.route(routes);
});

module.exports = server;
