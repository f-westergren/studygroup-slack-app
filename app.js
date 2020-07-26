const express = require("express");
const app = express();
const iRoute = require('./routes');
const bodyParser = require('body-parser');

// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', iRoute)

app.use('*', (req, res) => {
  return res.status(404).send('Page not found')
})

app.listen(3000, () => {
  console.log('Server starting on port 3000.')
})