const express = require('express');
const morgan = require('morgan');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;
const { connectToDb } = require('./lib/mongo');
/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

connectToDb(() => { //connect to DB before start to listen for requests.
  app.listen(port, () => {
    console.log("== Server is listening on port:", port);
  
  });
});