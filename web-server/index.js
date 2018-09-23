const express = require('express');
const uuid = require('uuid/v4');
const app = express();
const port = process.env.PORT || 8080;
const server = process.env.SERVER || "server1";

app.get('/', (req, res) => {
  res.set('X-CookieStore', `${server} ${uuid()}`);
  res.send('Hello World!');
})

app.use(express.static('static'));

app.listen(port, () => console.log(`Web server listening on port ${port}!`))
