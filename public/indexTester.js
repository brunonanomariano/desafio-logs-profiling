const socket = io()
const loadedProductsTest = document.getElementById("loadedProductsTest")

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

socket.on('productsTest', data=> {
    let tabla = construirTabla (data)
    loadedProductsTest.innerHTML = tabla
})