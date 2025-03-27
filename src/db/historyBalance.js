import { HistoryBalanceType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { hasAttributes, isEmpty, isRowId, isUserActive } from '../util/index.js'
import logger from '../util/logger.js'
import { prisma } from './index.js'

const libName = '[historyBalance]'
export const historyBalanceForCriteria = async ({ user, id, idUser, type } = {}) => {
  const fName = `${libName} [historyBalanceForCriteria]`

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
      const error = 'El id del usuario a filtrar no es valido'
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `idUser : '${idUser}' `
    where.idUser = idUser
  }

  if (!isEmpty(type)) {
    if (!Object.keys(HistoryBalanceType).includes(type)) {
      const error = 'El tipo de historial de balance a filtrar no es valido'
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    logData += `tipo de balance : '${type}' `
    where.type = type
  }

  try {
    logger.info(`${fName} ${logData}`)
    const resp = await prisma.historyBalance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: resp }
  } catch (err) {
    const error = 'Error al filtrar el historial de balance'
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
export const upsertHistoryBalance = async ({ user, data } = {}) => {
  const fName = `${libName}[upsertHistoryBalance]`

  if (!isUserActive(user)) {
    const error = `El usuario ${user?.id} no esta activo`
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(data)) {
    const error = 'No se proporciono informacion para crear/actualizar el historial de balance'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  // Si no se ha proporcionado un ID, se genera uno nuevo
  let oldData = {}
  if (!isRowId(data.id)) {
    data.id = uuidv4()
  } else {
    // Verifica si ya existe un el historial de balance con el mismo id
    const old = await historyBalanceForCriteria({ id: data.id })
    if (!old?.success) {
      const error = `El historial de balance con id ${data.id} no existe`
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    // Obtienen los datos del historial
    ;[oldData] = old.data ?? []
  }

  let result = {}
  try {
    if (!isRowId(oldData?.id)) {
      if (!hasAttributes(data, ['idUser', 'amount', 'type'])) {
        const error =
          'No se proporcionaron los datos necesarios para crear el el historial de balance'
        logger.error(`${fName} ${error}`)
        return { success: false, error }
      }

      if (!Object.keys(HistoryBalanceType).includes(data?.type)) {
        const error = 'El tipo de historial de balance a filtrar no es valido'
        logger.error(`${fName} ${error}`)
        return { success: false, error }
      }

      logger.info(`${fName} Creando el historial de balance con id: ${data.id} `)
      result = await prisma.historyBalance.create({
        data: {
          id: data.id,
          idUser: data.idUser,
          amount: data.amount,
          type: data.type,
          byUser: user?.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      // actualiza los datos del el historial de balance, contenidos en *data*
      Object.keys(data).forEach((key) => {
        if (!['id'].includes(key)) {
          oldData[key] = data[key]
        }
      })

      logger.info(`${fName} Actualizando el historial de balance con id: ${data.id}`)
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
    const error = `Error al crear/actualizar el el historial de balance`
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error, exception: err }
  }

  return { success: true, data: result }
}
