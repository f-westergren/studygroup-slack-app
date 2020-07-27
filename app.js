const express = require("express");
const app = express();
const iRoute = require('./routes');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ 
  extended: true,
  verify: rawBodySaver
 }))
 
app.use('/', iRoute)

app.use('*', (req, res) => {
  return res.status(404).send('Page not found')
})

app.listen(3000, () => {
  console.log('Server starting on port 3000.')
})


// Get raw request body.
function rawBodySaver (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err
  });
});