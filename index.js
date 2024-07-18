//Declaracion, libreria, instancia,modulos, identificadores unicos
const express = require("express");
const app = express(); 
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');

app.use(bodyParser.json());
//declaracion de variable
let ruleta = [];

app.post('/crearRuleta', (res, req) => {
    const nuevaRuleta ={
        id: uuidv4(); //genera un id para la nueva ruleta 
        ...req.body
    };

    ruleta.push(nuevaRuleta);
//envio de la respuesta con codigo HTTP
    res.status(201).json({id: nuevaRuleta.id}); 
});
//Definicion de puerto, 
app.set('PORT', 4000);
app.listen(app.get('PORT'));