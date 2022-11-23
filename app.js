const express = require('express')
const handlebars = require('express-handlebars')
const app = express()
const productsRouter = require('./routes/products')

const server = app.listen(8080, () => console.log('Server UP'))
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

let prod = []

app.get('/', (req, resp)=>{
    resp.render('formulario')
})

app.get('/productos', (req, resp)=>{
    resp.render('productos', {prods: prod})
})

app.post('/productos', (req, resp)=>{
    prod.push(req.body)
    resp.redirect('/')
})

app.use(express.json())
app.use(express.static('public'))
app.use('/api/productos', productsRouter)