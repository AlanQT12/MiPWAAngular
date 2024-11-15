const express = require('express');
const path = require('path');

const app = express();

// Cambia esta ruta si el build no está en "dist/pwa-angular2"
app.use(express.static(path.join(__dirname, 'dist/pwa-angular2')));

// Redirige todas las rutas al archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/pwa-angular2/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
