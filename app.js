// se Importa las librerías necesarias
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//se Crea una nueva instancia de Express
const app = express();

// Configuración del body-parser para manejar solicitudes JSON
app.use(bodyParser.json());

//Conectar a mongoDB
mongoose.connect('mongodb://localhost:27017/ruletas').then(() => {
    console.log('Conectado a mongoDB');
}).catch(err => {
    console.error('Error al conectar a mongoDB', err)
});

//Definicion esquemas y modelos de mongoose
const ApuestaSchema = new mongoose.Schema({
    usuarioId: String,
    cantidad: Number,
    tipoApuesta: String,
    valor: mongoose.Mixed
});

const RuletaSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    estado: String,
    apuestas: [ApuestaSchema]
});

const Ruleta = mongoose.model('Ruleta', RuletaSchema);

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi aplicación!');
});

// Endpoint para crear una nueva ruleta
app.post('/crearRuleta', async (req, res) => {
    const nuevaRuleta = new Ruleta ({
        id: uuidv4(), // Genera un id para la nueva ruleta
        estado: 'cerrada', //Inicialmente, la ruleta esta cerrada
        apuesta: [], //Almacena las apuestas realizadas
        ...req.body
    });

    await nuevaRuleta.save();

    // Enviar respuesta con código HTTP 201 (Created) y el id de la nueva ruleta
    res.status(201).json({ id: nuevaRuleta.id });
});

//Endpoint para abrir una ruleta
app.post('/abrirRuleta', async (req, res) => {
    try{
        const { id } = req.body;
        //Verificacion si el ID esta presente, si no esta presente se devuelte una respuesta con codigo HTTP 400
        if (!id) {
            return res.status(400).json({ estado: 'denegado', mensaje: 'ID es requerido'});
        }

        const ruleta = await Ruleta.findOne({ id });
        if (!ruleta) {
            return res.status(404).json({ estado: 'denegado', mensaje: 'Ruleta no encontrada' });
        }

        if (ruleta.estado === 'abierta') {
            return res.status(400).json({estado: 'denegado', mensaje: 'La ruleta ya esta abierta'});
        }

        ruleta.estado = 'abierta';
        await ruleta.save();

        res.status(200),json({estado: 'exitoso'});
    } catch (error) {
        res.status(500).json({estado: 'denegado', mensaje: 'Error del servidor'});
    }
});
//Endpoint para realizar una apuesta
app.post('/apuesta', async (req, res) => {
    try {
        const { ruletaId, cantidad, tipoApuesta, valor} = req.body;
        const usuarioId = req.headers['usuario-id'];

        if (!usuarioId) {
            return res.status(400).json({estas: 'denegado', mensaje:'ID de usuario es requerido'});

        }
        if (!ruletaId || !cantidad || !tipoApuesta || !valor) {
            return res.status(400).json({estado: 'denegado', mensaje: 'Todos los campos deben ser diligenciados'});
        }
        if (cantidad > 10000) {
            return res.status(400).json({estado: 'denegado', mensaje: 'la cantidad maxima es de 10,000 mil dolares'});
        }

        const ruleta =  await Ruleta.findOne({id: ruletaId});
        if(!ruleta) {
            return res.status(404).json({estado: 'denegado', mensaje: 'Ruleta no encontrada'});
        }
        if (ruleta.estado !== 'abierta') {
            return res.status(400).json({estado: 'denegado', mensaje: 'la ruleta no esta abierta'});
        }

        if(tipoApuesta === 'numero'){
            if (valor < 0 || valor > 36){
                return res.status(400).json({estado: 'denegado', mensaje:'El numero debe estar entre 0 y 36'});
            }
        } else if (tipoApuesta === 'color') {
            if (valor !== 'rojo' && valor !== 'negro') {
                return res.status(400).json({estado: 'denegado', mensaje: 'el color debe de ser rojo o negro'});
            }
        } else {
            return res.status(400).json({estado: 'denegado', mensaje: 'Tipo de apuesta no valida'});
        }

        ruleta.apuestas.push({
            usuarioId,
            cantidad,
            tipoApuesta,
            valor
        });
        await ruleta.save();

        res.status(200).json({ estado: 'exitoso', mensaje: 'Apuesta registrada correctamente'});
    } catch (error) {
        res.status(500).json({estado:'denegado', mensaje: 'Error del servidor'});
    }
});

//Endpoint para cerra una ruleta y calcular resultados 
app.post('/cerrarRuleta', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ estado: 'denegado', mensaje: 'ID requerido'});
        }

        const ruleta =  await Ruletas.findOne({id});
        if(!ruleta) {
            return res.status(400).json({ estado: 'denegado', mensaje: 'Ruleta no encontrada'});
        }
        if (ruleta.estado !== 'abierta'){
            return res.status(400).json({estado: 'denegado', mensaje: 'Laruleta no esta abierta'});
        }

        ruleta.estado = 'cerrada';

        const numeroGanador = Math.floor(Math.random() * 37);
        const colorGanador = numeroGanador % 2 === 0 ? 'rojo' : 'negro';

        const resultado = ruleta.apuestas.map( apuesta => {
            if (apuesta.tipoApuesta === 'numero'  && apuesta.valor === numeroGanador){
                return {usuarioId: apuesta.usuarioId, ganancia: apuesta.cantidad * 5};
            } else if (apuesta.tipoApuesta === 'color' && apuesta.valor === colorGanador) {
                return { usuarioId: apuesta.usuarioId, ganancia: apuesta.cantidad * 1.8};
            } else {
                return {usuarioId: apuesta.usuarioId, ganancia: 0};
            }
        });

        await Ruleta.save();

        res.status(200).json({
            estado: 'exitoso',
            numeroGanador,
            colorGanador,
            resultado
        });
    } catch (error) {
        res.status(500).json({ estado: 'denegado', mensaje: 'Error del servidor'});
    }
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

// Configura el puerto en el que va a escuchar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

