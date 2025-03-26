import { v4 as uuidv4 } from 'uuid'
import { hasAttributes, isEmpty, isRowId, isUserActive, textForDBSearch } from '../util/index.js'
import logger from '../util/logger.js'
import { prisma } from './index.js'

const libName = '[suscriptionTypes]'
export const suscriptionTypesForCriteria = async (
  { user, id, keyName, name, isEnabled = false } = {},
  { includeConfig = false } = {}
) => {
  const fName = `${libName} [suscriptionTypesForCriteria]`

  if (!isUserActive(user)) {
    const error = 'El usuario no esta activo'
    logger.error(`${libName} ${fName} ${error}`)
    return { success: false, error }
  }

  let logData = 'Filtrando por: '
  let where = { isEnabled }

  if (!isEmpty(id)) {
    if (!isRowId(id)) {
      const error = 'El id no es valido '
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `id : '${id}' `
    where.id = id
  }

  if (!isEmpty(keyName)) {
    keyName = textForDBSearch(keyName)
    where.keyName = { contains: keyName, mode: 'insensitive' }
    logData += `keyName de tipo archivo : '${keyName}' `
  }

  if (!isEmpty(name)) {
    name = textForDBSearch(name)
    where.name = { contains: name, mode: 'insensitive' }
    logData += `name de tipo archivo : '${name}' `
  }

  try {
    logger.info(`${fName} ${logData}`)
    const resp = await prisma.suscriptionTypes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: resp }
  } catch (err) {
    const error = 'Error al filtrar los tipos de suscripcion'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}

/**
 * Funcion para crear o actualizar un tipo de suscripcion
 * @param {*} user
 * @param {*} data
 * @returns
 */
export const upsertSuscriptionTypes = async ({ user, data } = {}) => {
  const fName = `${libName}[upsertSuscriptionTypes]`

  if (!isUserActive(user)) {
    const error = `El usuario ${user?.id} no esta activo`
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(data)) {
    const error = 'No se proporciono informacion para crear/actualizar tipo de suscripcion'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  // Si no se ha proporcionado un ID, se genera uno nuevo
  let oldData = {}
  if (!isRowId(data.id)) {
    data.id = uuidv4()
  } else {
    // Verifica si ya existe un tipo de suscripcion con el mismo id
    const old = await suscriptionTypesForCriteria({ id: data.id })
    if (!old?.success) {
      const error = `El tipo de suscripcion con id ${data.id} no existe`
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    // Obtienen los datos de tipos de suscripcion
    ;[oldData] = old.data ?? []
  }

  let result = {}
  try {
    if (!isRowId(oldData?.id)) {
      if (!hasAttributes(data, ['keyName', 'name', 'description', 'price'])) {
        const error = 'No se proporcionaron los datos necesarios para crear el tipo de suscripcion'
        logger.error(`${fName} ${error}`)
        return { success: false, error }
      }

      logger.info(`${fName} Creando tipo de suscripcion con id: ${data.id} `)
      result = await prisma.suscriptionTypes.create({
        data: {
          id: data.id,
          name: data?.name,
          keyName: data?.keyName,
          price: data?.price,
          description: data?.description,
          isEnabled: data?.isEnabled,
          byUser: user?.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      // actualiza los datos del tipo de suscripcion, contenidos en *data*
      Object.keys(data).forEach((key) => {
        if (!['id'].includes(key)) {
          oldData[key] = data[key]
        }
      })

      logger.info(`${fName} Actualizando tipo de suscripcion con id: ${data.id}`)
      result = await prisma.medmagFileTypes.update({
        where: {
          id: data.id,
        },
        data: {
          name: oldData?.name,
          keyName: oldData?.keyName,
          price: oldData?.price,
          description: oldData?.description,
          isEnabled: oldData?.isEnabled,
          updatedAt: new Date(),
          byUser: user?.id,
        },
      })
    }
  } catch (err) {
    const error = `Error al crear/actualizar el tipo de suscripcion`
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error, exception: err }
  }

  return { success: true, data: result }
}
