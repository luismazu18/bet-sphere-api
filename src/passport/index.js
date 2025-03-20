import passport from 'passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'
import PassportJWT from 'passport-jwt'
import LocalStrategy from 'passport-local'
import { getAuthUser, getUser } from '../db/users.js'
import { fakeUser } from '../util/constants.js'
import logger from '../util/logger.js'

const libName = '[passport/index]'

const JWTStrategy = PassportJWT.Strategy
const ExtractJWT = PassportJWT.ExtractJwt

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, cb) => {
      const getUser = await getAuthUser(email, password)

      const usr = getUser?.data ?? {}

      if (!usr?.data?.id) {
        const error = 'Las credenciales no son validas'
        logger.info(`${libName} ${error}`)
        return cb(error)
      }

      if (!usr?.data?.enabled) {
        const error = 'El usuario no esta activo'
        logger.info(`${libName} ${error}`)
        return cb(error)
      }

      return cb(null, { id: usr?.data.id })
    }
  )
)

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, cb) => {
      // find the user in the DB based on the 'destination' in the JWT
      const users = await getUser({ id: payload.id })

      if (!users?.success) {
        const error = users?.error ?? 'Ha sucedido un error validando el usuario'
        logger.error(`${libName} ${error}`)
        return cb(error, false)
      }

      if (users?.data) {
        const [usr] = users.data
        return cb(null, usr)
      }

      const error = `No se encontro el usuario con id: ${payload.id}`
      logger.error(`${libName} error`)
      return cb(error, false)
    }
  )
)

passport.use(
  'headerapikey',
  new HeaderAPIKeyStrategy({ header: 'Authorization', prefix: 'Api-Key ' }, false, (apiKey, cb) => {
    if (apiKey === process.env.API_KEY) {
      return cb(null, { id: fakeUser, isActive: true, enabled: true })
    }
    return cb('Unauthorized API KEY')
  })
)

export default passport
