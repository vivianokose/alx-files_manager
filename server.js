// server.js


const express = require('express');

const app = express();
const port = process.env.PORT || 5000
const index = require('./routes/index');

app.use('/', index)

app.listen(port, () =>{
  console.log(`Server is listening on port ${port}`);
})


module.exports = app;
