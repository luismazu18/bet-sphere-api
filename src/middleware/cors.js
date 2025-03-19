import cors from 'cors'

const origin = JSON.parse(process.env.CORS_ORIGINS ?? '"*"')

export const corsMiddleware = cors({
  origin,
  optionsSuccessStatuts: 200,
})

//export const authToken = [passport.authenticate('jwt', { session: false })]
