const express = require('express');
const uuid = require('uuid/v4');
const mustacheExpress = require('mustache-express');
const cookieSession = require('cookie-session');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 8080;

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(cookieSession({
  name: 'session',
  secret: 'secret', // TODO Be secure
  maxAge: 30 * 60 * 1000
}));

app.get('/', (req, res) => {
  if (!req.session.isPopulated) {
    req.session.uid = uuid();
  }
  var host = req.get('Host');
  var server = host.split('.')[0];

  var color = '#' + crypto.createHash('md5').update(host).digest("hex").substring(0, 6) + '7f';

  res.set('X-CookieStore', `${server} ${req.session.uid}`);
  res.render('index.mustache', {server: server, host: host, uid: req.session.uid, color: color});
})

app.use(express.static('static'));

app.listen(port, () => console.log(`Web server listening on port ${port}!`))
