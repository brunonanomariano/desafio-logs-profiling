const express = require('express')
const router = express.Router()
const {fork} = require('child_process')
const {loggerConsola, loggerWarning, loggerError} = require('../utils.js')

router.get('/', (req, res) => {

    let cant = req.query.cant
    if (cant){
        cant = parseInt(cant)
    } else{
        cant = 100000
    }

    
    const result = fork('./routes/getRandom.js')
    loggerConsola.info(`Se accedio a la ruta ${req._parsedOriginalUrl.path} mediante el metodo ${req.method}`)

    result.send(cant)

    result.on('message', resultado=>{
        res.send(resultado)
    })

})

module.exports = router