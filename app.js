// se Importa las librerías necesarias
const express = require('express');
// const morgan = require("morgan");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

//se Crea una nueva instancia de Express
const app = express();

// Configuración del body-parser para manejar solicitudes JSON
app.use(bodyParser.json());

//middlewares
// app.use(morgan("dev"));

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
        estado: 'cerrada', //Inicialmente, la ruleta esta cerrada
        ...req.body
    };

    ruletas.push(nuevaRuleta);

    // Enviar respuesta con código HTTP 201 (Created) y el id de la nueva ruleta
    res.status(201).json({ id: nuevaRuleta.id });
});

//Endpoint para abrir una ruleta
app.post('/abrirRuleta', (req, res) => {
    try{
        const { id } = req.body;
        //Verificacion si el ID esta presente, si no esta presente se devuelte una respuesta con codigo HTTP 400
        if (!id) {
            return res.status(400).json({ estado: 'denegado', mensaje: 'ID es requerido'});
        }

        const ruleta = ruleta.find(r = r.id === id);
        if (!ruleta) {
            return res.status(404).json({estado: 'denegado', mensaje: 'Ruleta no encontrada'});
        }

        if (ruleta.estadoi === 'abierta') {
            return res.status(400).json({estado: 'denegado', mensaje: 'La ruleta ya esta abierta'});
        }

        ruleta.estado = 'estado';
        res.status(200),json({estado: 'Exitoso'});
    } catch (error) {
        res.status(500).json({estado: 'denegado', mensaje: 'Error del servidor'});
    }
})
// Manejador de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

// Configura el puerto en el que va a escuchar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

