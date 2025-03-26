import { v4 as uuidv4 } from 'uuid'
import { hasAttributes, isEmpty, isRowId, isUserActive } from '../util/index.js'
import logger from '../util/logger.js'
import { prisma } from './index.js'

const libName = '[userSuscriptions]'
export const userSuscripcionsForCriteria = async ({
  user,
  id,
  idUser,
  idSuscription,
  isEnabled = false,
} = {}) => {
  const fName = `${libName} [userSuscripcionsForCriteria]`

  if (!isUserActive(user)) {
    const error = 'El usuario no esta activo'
    logger.error(`${libName} ${fName} ${error}`)
    return { success: false, error }
  }

  let logData = 'Filtrando por: '
  let where = {}

  if (!isEmpty(id)) {
    if (!isRowId(id)) {
      const error = 'El id no es valido '
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `id : '${id}' `
    where.id = id
  }

  if (!isEmpty(idUser)) {
    if (!isRowId(idUser)) {
      const error = 'El idUser no es valido '
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `idUser : '${idUser}' `
    where.idUser = idUser
  }

  if (!isEmpty(idSuscription)) {
    if (!isRowId(idSuscription)) {
      const error = 'El idSuscription no es valido '
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `idSuscription : '${idSuscription}' `
    where.idSuscription = idSuscription
  }

  if (isEmpty(where)) {
    const error = 'No se proporciono ningun criterio de busqueda'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  where.isEnabled = isEnabled

  try {
    logger.info(`${fName} ${logData}`)
    const resp = await prisma.userSuscriptions.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: resp }
  } catch (err) {
    const error = 'Error al filtrar las suscripciones de usuario'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}

/**
 * Funcion para crear o actualizar relacion de suscripcion con usuario
 * @param {*} user
 * @param {*} data
 * @returns
 */
export const upsertUserSuscriptions = async ({ user, data } = {}) => {
  const fName = `${libName}[upsertUserSuscriptions]`

  if (!isUserActive(user)) {
    const error = `El usuario ${user?.id} no esta activo`
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(data)) {
    const error =
      'No se proporciono informacion para crear/actualizar relacion de suscripcion con usuario'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  // Si no se ha proporcionado un ID, se genera uno nuevo
  let oldData = {}
  if (!isRowId(data.id)) {
    data.id = uuidv4()
  } else {
    // Verifica si ya existe una relacion de suscripcion con el mismo id
    const old = await userSuscripcionsForCriteria({ id: data.id })
    if (!old?.success) {
      const error = `El tipo de suscripcion con id ${data.id} no existe`
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    // Obtienen los datos de relacion de suscripcion con usuario
    ;[oldData] = old.data ?? []
  }

  let result = {}
  try {
    if (!isRowId(oldData?.id)) {
      if (!hasAttributes(data, ['idUser', 'idSuscription'])) {
        const error =
          'No se proporcionaron los datos necesarios para crear relacion de suscripcion con usuario'
        logger.error(`${fName} ${error}`)
        return { success: false, error }
      }

      logger.info(`${fName} Creando relacion de suscripcion con usuario con id: ${data.id} `)
      result = await prisma.userSuscriptions.create({
        data: {
          id: data.id,
          idUser: data?.idUser,
          idSuscription: data?.idSuscription,
          isEnabled: data?.isEnabled,
          byUser: user?.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      // actualiza los datos de la relacion de suscripcion usuarios, contenidos en *data*
      Object.keys(data).forEach((key) => {
        if (!['id'].includes(key)) {
          oldData[key] = data[key]
        }
      })

      logger.info(`${fName} Actualizando relacion de suscripcion con usuario con id: ${data.id}`)
      result = await prisma.medmagFileTypes.update({
        where: {
          id: data.id,
        },
        data: {
          idUser: oldData?.idUser,
          idSuscription: oldData?.idSuscription,
          isEnabled: oldData?.isEnabled,
          updatedAt: new Date(),
          byUser: user?.id,
        },
      })
    }
  } catch (err) {
    const error = `Error al crear/actualizar relacion de suscripcion con usuario`
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error, exception: err }
  }

  return { success: true, data: result }
}
