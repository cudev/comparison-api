import serialize from 'serialize-javascript';
import config from './config';

export default function renderFullPage(html, initialState) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Comparisons Dashboard</title>
      <link rel="stylesheet" href="${config.assets}/stylesheets/bundle.css">
      <script>
        window.config = ${serialize(config)};
        window.initialState = ${serialize(initialState)};
      </script>
    </head>
    <body>
      <div id="app">${html}</div>
      <script src="${config.assets}/scripts/vendor.js"></script>
      <script src="${config.assets}/scripts/bundle.js"></script>
    </body>
  </html>`;
}
