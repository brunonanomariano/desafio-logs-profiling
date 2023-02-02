process.on('message', cant=>{
    let arrayRadoms = []

    for (let i = 0 ; i < cant; i++ ){
            let numAleatorio = Math.floor(Math.random() * (1000 - 1) + 1)
            let arrayNumeros = arrayRadoms.map(elem => elem.numero)
            let indiceRepetido = arrayNumeros.indexOf(numAleatorio)
            if (indiceRepetido === -1){
                arrayRadoms.push({numero: numAleatorio, cantidad: 1 })
            } else {
                arrayRadoms[indiceRepetido].cantidad = arrayRadoms[indiceRepetido].cantidad + 1
            }
    }
        
    process.send(arrayRadoms)

})