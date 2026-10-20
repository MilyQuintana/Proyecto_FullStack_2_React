// Punto de entrada de Karma: carga automáticamente todos los *.spec.js(x)
const context = require.context("./", true, /\.spec\.jsx?$/);
context.keys().forEach(context);
