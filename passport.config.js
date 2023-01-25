const passport = require('passport')
const local = require('passport-local')
const users = require('./models/user.js')
const {createHash, isValid} = require('./utils.js')

const LocalStrategy = local.Strategy

const initializePassport = () => {
    passport.use(
        'register',
        new LocalStrategy (
            { passReqToCallback: true },
            async (req, username, password, done) => {
                try {
                    let user = await users.findOne({ username })
                    if (user) return done(null, false)
                    const newUser = {
                        username: username,
                        password: createHash(password)
                    }
                    try {
                        let result = await users.create(newUser)
                        return done(null, result)
                    } catch(err) { 
                        done(err)
                    }
                } catch(err) {
                    done(err)
                }
            })
        )

        passport.serializeUser((user, done) => {
            done(null, user._id)
        })
        passport.deserializeUser((id, done) => {
            users.findById(id, done)
        })

    passport.use(
        'login',
        new LocalStrategy(
            async(username, password, done) => {
                try {
                    let user = await users.findOne({ username })
                    if (!user) return done(null, false)
                    if (!isValid(user, password)) return done(null, false)
                    return done(null, user)
                } catch(err) {
                    done(err)
                }
            }
        )
    )
}

module.exports = initializePassport