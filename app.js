// Importar las librerías necesarias
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Crear una nueva instancia de Express
const app = express();

// Configurar body-parser para manejar solicitudes JSON
app.use(bodyParser.json());

// Array para almacenar las ruletas creadas
let ruletas = [];

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi aplicación!');
});

// Endpoint para crear una nueva ruleta
app.post('/crearRuleta', (req, res) => {
    const nuevaRuleta = {
        id: uuidv4(), // Genera un id para la nueva ruleta
        ...req.body
    };

    ruletas.push(nuevaRuleta);

    // Enviar respuesta con código HTTP 201 (Created) y el id de la nueva ruleta
    res.status(201).json({ id: nuevaRuleta.id });
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

// Configurar el puerto en el que va a escuchar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

