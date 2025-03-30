import { registryUser } from '../../db/users.js'
import { genericErrorCreateUser } from '../../util/constants.js'
import { isEmpty, isUserActive } from '../../util/index.js'
import logger from '../../util/logger.js'

export default async (req, res) => {
  const libName = '[registry-user]'

  const user = req.user ?? {}
  if (!isUserActive(user)) {
    const error = 'El usuario no esta activo'
    logger.error(`${libName} ${error}`)
    return res.status(400).json({ success: false, error: genericErrorCreateUser })
  }

  const data = req.body ?? {}
  if (isEmpty(data)) {
    const error = 'No se proporciono informacion para crear usuario'
    logger.error(`${libName} ${error}`)
    return res.status(400).json({ success: false, error: genericErrorCreateUser })
  }

  const outPut = await registryUser({ user, data })

  if (!outPut.success) {
    const error = 'Error al crear el usuario'
    logger.error(`${libName} ${error}`)
    return res.status(400).json({ success: false, error: genericErrorCreateUser })
  }

  res.status(200).json(outPut)
}
