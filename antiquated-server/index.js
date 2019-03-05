const express = require('express');
const browserslist = require('browserslist-useragent');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const defaultOptions = {
  // This query attempts to avoid including unexpected niche browsers like
  // blackberry and IE mobile
  // See https://jamie.build/last-2-versions
  // See https://browserl.ist/?q=%3E0.25%25%2C+not+ie+11%2C+not+op_mini+all
  browsers: [
    '>0.25%',
    'not ie 11',
    'not op_mini all',
  ],
  // Provide this to ensure new browser rekeases oass the doesMatch check
  allowHigherVersions: true,
};

function doesMatch(userAgent, incomingOptions) {
  return browserslist.matchesUA(userAgent, {
    ...defaultOptions,
    ...incomingOptions,
  });
}

function antiquatedHandler(req, res) {
  // Set some cache headers so the server provider doesn't eat your wallet..
  // Oh, and for performance too I guess :)
  res.set({
    Vary: 'User-Agent',
    'Cache-Control': 'public, s-max-age=31536000, max-age=31536000, immutable',
  });

  switch (req.method) {
    case 'GET':
      res.send({ matches: doesMatch(req.get('User-Agent')) });
      break;
    case 'POST':
      res.send({ matches: doesMatch(req.body.userAgent, req.body.options) });
      break;
    default:
      res.status(405).send({ error: 'Only GET or POST is supported' });
      break;
  }
}

app.all('/', antiquatedHandler);

// Expose some functions as API
app.doesMatch = doesMatch
app.antiquatedHandler = antiquatedHandler

// Express is default export to allow usage as lambda function
module.exports = app;
