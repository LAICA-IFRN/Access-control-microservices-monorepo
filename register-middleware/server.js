const express = require('express');
const app = express();
const port = 3008;

require('dotenv').config();

app.get('/', (req, res) => {
  console.log(req.query);
  console.log(req.params);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>laica</title>
    </head>
    <body>
      <script>
        function getTokenFromHash() {
          const hash = window.location.hash.substr(1);
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          return accessToken;
        }

        const token = getTokenFromHash();

        window.location.href = '${process.env.REDIRECT_URL}?id=${req.query.id}&token='+token;
      </script>
    </body>
    </html>`
  );
});

app.listen(port);
