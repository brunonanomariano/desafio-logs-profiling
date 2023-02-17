const bcrypt = require('bcrypt') 
const log4js = require('log4js')

const loggerConsola = log4js.getLogger('default')
const loggerWarning = log4js.getLogger('WARNING')
const loggerError = log4js.getLogger('ERROR')

log4js.configure({
    appenders: {
        consola: { type: "console" },
        warningFile: { type: "file", filename: './logs/warn.log'},
        errorFile: { type: "file", filename: './logs/error.log'}
    },
    categories: {
        default: {
            appenders: ["consola"],
            level: "ALL"
        },
        WARNING: {
            appenders: ["warningFile"],
            level: "WARN"
        },
        ERROR: {
            appenders: ["errorFile"],
            level: "ERROR"
        }
    }
})

const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

const isValid = (user, password) => {
    return bcrypt.compareSync(password, user.password)
}

module.exports = {createHash, isValid, loggerConsola, loggerError, loggerWarning}