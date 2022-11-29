const socket = io()
const productForm = document.getElementById("productForm")
const loadedProducts = document.getElementById("loadedProducts")
const email = document.getElementById("email")
const chatHistory = document.getElementById("chatHistory")
const send = document.getElementById("send")
const chatBox = document.getElementById("chatBox")
const errorEmail = document.getElementById("errorEmail")
const formTitle = document.getElementById("formTitle")
const formPrice = document.getElementById("formPrice")
const formThumbnail = document.getElementById("formThumbnail")
const errorForm = document.getElementById("errorForm")

//Al iniciar la pagina se deshabilitan el chatBox y el boton de enviar hasta no completar el correo
chatBox.disabled = true
send.disabled = true

//Variable global para almacenar el correo electronico
let usuario

//Captura de producto cargado por formulario
productForm.addEventListener("submit", (e) => {
    e.preventDefault()
    let mensajeError = ""
    let obj = {}
    let datosForm = new FormData(productForm)
    datosForm.forEach( (value, key) => obj[key] = value )
    if (obj.title && obj.price && obj.thumbnail){
        socket.emit('product', obj)
        formTitle.value=""
        formPrice.value=""
        formThumbnail.value=""
        mensajeError = ""
    } else {
        mensajeError = "Uno o mas campos del formulario se encuentran vacios"
    }
    
    errorForm.innerHTML = mensajeError
} )

//Funcion que construye la tabla de productos a partir de un listado
const construirTabla = (productos) => {
    let encabezado = ``
    let cuerpo = ``
    let tablaFinal = ``

    if (productos.length > 0){
        encabezado = `
        <table style="width:100% ; border:1px solid black">
        <th>Producto</th>
        <th>Precio</th>
        <th>Imagen</th>
    `    
        productos.forEach( producto => {
            cuerpo += 
            `<tr>
                <td style="border:1px solid black">${producto.title}</td>
                <td style="border:1px solid black">${producto.price}</td>
                <td style="border:1px solid black">
                    <img src="${producto.thumbnail}" width="100" height="100">
                </td>
            </tr>
        `
        })

        cuerpo += `</table>`

        tablaFinal = encabezado + cuerpo
    }
      
    return tablaFinal
}


socket.on('products', data =>{
    let tabla = construirTabla (data)
    loadedProducts.innerHTML = tabla
})

//Funcion dedicada a verificar la existencia de un solo @ para validar el formato del correo
const unSoloArroba = (cadena) => {
    let cantidad = 0
    cadena.forEach( caracter => {
        if ( caracter === "@" ) {
            cantidad += 1
        }
    })
    if ( cantidad === 1 ) {
        return true
    } else {
        return false
    }
}

//Valida el formato de correo, no puede empezar con @, ., -, el final de la cadena debe ser .com, debe tener un solo @
//y no puede tener espacios en blanco
const validarEmail = (email) => {
    let correo = email.split('')
    if ( correo[0] !== "@" && correo.some(caracter => caracter === "@") && correo[correo.length-5] !== "@" &&
         correo[correo.length-4] === "." && correo[correo.length-3] === "c" && correo[correo.length-2] === "o" &&
         correo[correo.length-1] === "m" && correo[0] !== "." && correo[0] !== "-" && 
         correo[0] !== "_" && unSoloArroba(correo) && !correo.some(caracter => caracter === " ")
    ) {
        return true
    } else {
        return false
    }
}

//Manejo del campo para ingresar el correo, debe ser valido para poder habilitar el chat
email.addEventListener("keyup", e =>{
    let mensaje = ''

    if (e.key === "Enter" ){
        if (validarEmail(email.value) === true){
            mensaje = ''
            errorEmail.innerHTML = mensaje
            email.disabled = true
            chatBox.disabled = false
            send.disabled = false
            usuario = email.value
        } else {
            mensaje = 'Formato de email no valido debe ser del tipo: direccion@dominio.com'
            errorEmail.innerHTML = mensaje
            chatBox.disabled = true
            send.disabled = true
        }   
    }

})

//Manejo del boton enviar, arma un objeto con los datos del usuario, la fecha y el mensaje
send.addEventListener("click", () => {
    let chat = {}
    let mensaje = chatBox.value.trim()
    if (mensaje.length > 0){
        let fecha = new Date()
        let dia = `${fecha.getDate()}/${fecha.getMonth()}/${fecha.getFullYear()}`
        let hora = `${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`
        chat = {usuario, mensaje, dia, hora}
        chatBox.value = ""
        socket.emit("chat", chat)
    }
    
})

//Manejo del render para el historial
socket.on("history", data =>{
    let mensajes = ""
    data.forEach(mensaje => {
        mensajes += `<span style="color: blue; font-weight:bolder"> ${mensaje.usuario}</span> 
                     <span style="color: brown"> [${mensaje.dia} ${mensaje.hora}]: </span>
                     <span style="color: green; font-style:italic"> ${mensaje.mensaje} </span> <br/>`
    })
    chatHistory.innerHTML = mensajes
})