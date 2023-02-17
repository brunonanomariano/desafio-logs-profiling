const express = require('express')
const { Server } = require('socket.io')
const handlebars = require('express-handlebars')
const app = express()
const TableManager = require('./controllers/tableManager.js')
const optionChat = require('./options/chatDB.js')
const optionProd = require('./options/productDb.js')
const fakerProducts = require('./options/fakerProducts')
const session = require('express-session')
const FileStore = require('session-file-store')
const cookieParser = require("cookie-parser")
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const initializePassport = require('./passport.config')
const passport = require('passport')
const dotenv = require('dotenv')
const yargs = require('yargs')
const { number } = require('yargs')
const randomsRouter = require('./routes/randoms')
const fork = require('child_process')
const cluster = require('cluster')
const core = require('os')
const compression = require('compression')
const {loggerConsola, loggerWarning, loggerError} = require('./utils.js')

dotenv.config()

let puerto = 8080
let procesadores = []
let modoCluster = false

app.use(compression());

yargs.command({
    command: 'set',
    describe: 'Set a PORT',
    builder: {
        port: {
            describe: 'PORT',
            demandOption: false,
            type: 'number'
        },
        mode: {
            describe: 'MODE',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv){
        if ( isNaN(argv.port) || argv.port===0 ){
            console.log("El puerto seteado es invalido, por defecto se utilizara el puerto 8080")
        } else {
            process.env.PORT = argv.port
            console.log(`Puerto ${puerto} seteado con exito`)
        }

        if (argv.mode === "CLUSTER"){
            modoCluster = true  
        } else if (argv.mode === "FORK" || argv.mode === "" ){
            modoCluster = false
        }
    }
})

yargs.parse()

if (cluster.isPrimary && modoCluster) {
    console.log(`Primary process ${process.pid} is running...`)
    console.log('Server iniciado en modo CLUSTER')
    //crear a los workers
    for (let i=0; i<core.cpus().length; i++) {
        cluster.fork()
    }
    cluster.on('exit', (worker, code) => {
        console.log(`Worker ${worker.process.pid} died with code ${code}!`)
        cluster.fork()
    })

} else {

    if (!modoCluster){
        console.log("Servidor iniciado en modo FORK")
    }

    mongoose.set('strictQuery', true)

    const connection = mongoose.connect(process.env.MONGO_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    
    const Store = FileStore(session)
    
    app.use(cookieParser());
    
    app.use(session({
        store: MongoStore.create({mongoUrl: process.env.MONGO_URL}),
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000,
          },
    }))
    
    const server = app.listen(process.env.PORT, () => console.log(`Server UP en worker ${process.pid}`))
    const io = new Server(server)
    
    const tablaChat = 'chat'
    const tablaProductos = 'products'
    
    let manejadorChat = new TableManager( optionChat, tablaChat)
    let manejadorProductos = new TableManager(optionProd, tablaProductos)
    
    initializePassport()
    app.use(passport.initialize())
    app.use(passport.session())
    
    app.use(express.urlencoded({extended: true}))
    app.use(express.static('public'))
    
    app.engine('handlebars', handlebars.engine())
    app.set('views', 'public/views')
    app.set('view engine', 'handlebars')
    
    
    const loginChecker = (req, res, next)=>{
        if(!req.session.user){
            res.redirect('/login')
        } else{
            next()
        }
    }
    
    
    app.get('/login', async(req,resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('login')
    })
    
    app.post('/login',passport.authenticate('login', { failureRedirect: '/failedLogin'}), async (req, resp)=>{
        req.session.user = {
            username: req.body.username
        }
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.redirect('/')
    })
    
    app.get('/failedLogin', (req, resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('failedLogin')
    })
    
    
    app.get('/register', async (req, resp) =>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('register')
    })
    
    app.post('/register', passport.authenticate('register', { failureRedirect: '/failedRegister'}), async(req,resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.redirect('/login')
    })
    
    app.get('/failedRegister', (req, resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('failedRegister')
    })
    
    app.get('/', loginChecker, async (req, resp)=>{
        await manejadorProductos.createTable()
        await manejadorChat.createTable()
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('home', {usuario: req.session.user.username})
    })
    
    app.post('/', async (req, resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        req.session.user = req.body.user
        resp.redirect('/')
    })
    
    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
              res.send({message: `Error ${err} al desloguearse`})
            }
          })
          loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
          res.render('logout', {usuario: req.session.user.username});
    })
    
    app.get('/api/productos-test', async (req, resp)=>{
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)
        resp.render('homeTester')
    })
    
    app.get('/info', async (req, res)=>{
        
        loggerConsola.info(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method}`)

        console.log(`Argumentos de entrada: ${process.argv}`)
        console.log(`Carpeta del proyecto: ${process.cwd()}`)
        console.log(`Process ID: ${process.pid}`)
        console.log(`Version de NODE: ${process.version}`)
        console.log(`Plataforma: ${process.platform}`)
        console.log(`Path de ejecucion: ${process.execPath}`)
        console.log(`Memoria usada: ${process.memoryUsage().rss}`)
        console.log(`Cantidad de procesadores: ${core.cpus().length}`)


        res.render('info',
                    {argEntrada: process.argv,
                     carpetaProyecto: process.cwd(),
                     processId: process.pid,
                     versionNode: process.version,
                     plataforma: process.platform,
                     pathEjecucion: process.execPath,
                     memoriaUsada: process.memoryUsage().rss,
                     cantidadProcesadores: core.cpus().length
                    })
    })
    
    /* app.use('/api/randoms', randomsRouter) */

    app.use((req, res) => {
        loggerConsola.warn(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method} no implementado`)
        loggerWarning.warn(`Se accedio a la ruta ${req.url} mediante el metodo ${req.method} no implementado`)
        res.status(404).send({error: -2, descripcion: `ruta ${req.baseUrl}${req.url} método ${req.method} no implementada`});
    });
    
    let historial = []
    let productos = []
    let productosTest = []
    
    io.on('connection', async socket =>{
        console.log("New client connected")
        productosTest = fakerProducts
        productos = await manejadorProductos.getInfo()
        historial = await manejadorChat.getInfo()
        socket.emit('products', productos)
        socket.emit("history", historial)
        socket.emit("productsTest", productosTest)
        socket.on('product', async data => {
            await manejadorProductos.save(data)
            productos = await manejadorProductos.getInfo()
            io.emit('products', productos)
        })
        socket.on("chat", async data =>{
            await manejadorChat.save(data)
            historial = await manejadorChat.getInfo()
            io.emit("history", historial)
        })
        socket.on("error", async mensaje=>{
            await loggerConsola.error(mensaje)
            await loggerError.error(mensaje)
        })
       
    })

}
