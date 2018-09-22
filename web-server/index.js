const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
  res.set('X-CookieStore', '123456789abcdef');
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
