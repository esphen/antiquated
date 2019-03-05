/* For local development using npm start */
const app = require('./index.js');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
});
