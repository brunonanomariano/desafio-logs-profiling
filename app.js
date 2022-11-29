const express = require('express')
const { Server } = require('socket.io')
const handlebars = require('express-handlebars')
const app = express()
const pathHistory = './history.txt';
const fs = require('fs');

const server = app.listen(8080, () => console.log('Server UP'))
const io = new Server(server)

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.engine('handlebars', handlebars.engine())
app.set('views', 'public/views')
app.set('view engine', 'handlebars')

let productos = []

app.get('/', (req, resp)=>{
    resp.render('home')
})

let historial = []

const writeFileMessages = (mensajes) => {

    fs.promises.writeFile(pathHistory, JSON.stringify(mensajes, null, 2));
}

io.on('connection', socket =>{
    console.log("New client connected")
    socket.emit('products', productos)
    socket.emit("history", historial)
    socket.on('product', data => {
        productos.push(data)
        io.emit('products', productos)
    })
    socket.on("chat", data =>{
        historial.push(data)
        writeFileMessages(historial)
        io.emit("history", historial)
    })
    
})