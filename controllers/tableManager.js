const knex = require('knex');
const { json } = require('stream/consumers');

let db 
let tabla

class TableManger {

    constructor(configObj, tabl){
        this.db = knex(configObj)
        this.tabla = tabl
    }   

    createTable = async ()=>{
        if (this.tabla === 'products'){
            const isCreated = await this.db.schema.hasTable(this.tabla);
            if (!isCreated){
                await this.db.schema.createTable(this.tabla, table=>{
                    table.string('title', 30);
                    table.integer('price');
                    table.string('thumbnail', 100);
                })
            }
        } else if (this.tabla === 'chat'){
            const isCreated = await this.db.schema.hasTable(this.tabla);
            if (!isCreated){
                await this.db.schema.createTable(this.tabla, table=>{
                    table.string('usuario', 50);
                    table.string('mensaje', 100);
                    table.string('dia', 10);
                    table.string('hora', 8);
                })
            }
        }
        
    }

    save = async (datos) => {
        await this.db(this.tabla).insert(datos)  
    }

    getInfo = async () => {
        let result = await this.db.from(this.tabla).select('*')
        return JSON.parse(JSON.stringify(result))
    }

}

module.exports = TableManger