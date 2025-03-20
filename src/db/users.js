import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {
  deleteInfoUser,
  emailFormatter,
  emptySpacesMadness,
  isEmpty,
  isRowId,
  isUserActive,
  validateMandatoryData,
} from '../util/index.js'
import logger from '../util/logger.js'
import { prisma } from './index.js'

const libName = '[db/users]'
export const registryUser = async ({ user, data } = {}) => {
  const fName = '[registryUser]'

  if (!isUserActive(user)) {
    const error = 'El usuario no esta activo'
    logger.error(`${libName} ${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(data)) {
    const error = 'No se proporciono informacion para crear usuario'
    logger.error(`${libName} ${fName} ${error}`)
    return { success: false, error }
  }

  const missingFields = validateMandatoryData(data, [
    'name',
    'email',
    'password',
    'documentType',
    'documentNumber',
  ])
  if (!isEmpty(missingFields)) {
    const error = 'No se proporcionaron todos los datos necesarios para crear el usuarios'
    logger.error(`${fName} ${error}`)
    return { success: false, error, missingFields }
  }

  try {
    logger.info(`${fName} Creando usuario...`)
    const salt = bcrypt.genSaltSync(10)
    const password = bcrypt.hashSync(data?.password ?? data?.documentNumber, salt)

    let newUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: emailFormatter(data?.email),
        name: data?.name,
        lastName: data?.lastName,
        password,
        documentType: data?.documentType,
        documentNumber: data?.documentNumber,
        phone: data?.phone,
        photo: data?.photo,
        byUser: user?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        enabled: true,
      },
    })

    newUser = deleteInfoUser(newUser)

    return { success: true, data: newUser }
  } catch (err) {
    const error = 'Error al crear usuario'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}

/**
 * Funcion para validar si el usuario tiene acceso a la aplicacion
 * @param {*} email
 * @param {*} password
 * @returns
 */
export const getAuthUser = async (email, password) => {
  const fName = `${libName} [getAuthUser]`

  if (isEmpty(email)) {
    const error = 'El correo es requerido'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(password)) {
    const error = 'La contraseña es requerida'
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  try {
    logger.info(`${fName} Buscando usuario con correo: ${email}...`)
    const [user] = await prisma.users.findMany({
      where: {
        email: emailFormatter(email),
      },
    })

    if (isEmpty(user)) {
      const error = 'El usuario no existe'
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    if (!bcrypt.compareSync(password, user.password)) {
      const error = 'La contraseña es incorrecta'
      logger.error(`${fName} ${error}`)
      return { success: false, error }
    }

    return { success: true, data: { id: user.id, enabled: user.enabled } }
  } catch (err) {
    const error = 'Ocurrio un error al obtener el usuario'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}

export const updateUser = async ({ id, data = {} }) => {
  const fName = `${libName} [putUser]`

  if (!isRowId(id)) {
    const error = `No se proporciono un id valido para actualizar usuario: ${id}`
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (isEmpty(data)) {
    const error = `No se proporcionaron datos para actualizar usuario: ${id}`
    logger.error(`${fName} ${error}`)
    return { success: false, error }
  }

  if (!isEmpty(data?.password)) {
    const salt = bcrypt.genSaltSync(10)
    data.password = bcrypt.hashSync(data?.password, salt)
  }

  if (!isEmpty(data?.email)) {
    data.email = emailFormatter(data?.email)
  }

  try {
    logger.info(`${fName} Actualizando usuario...`)
    const user = await prisma.users.update({
      where: { id },
      data: {
        name: data?.name,
        lastName: data?.lastName,
        email: data?.email,
        password: data?.password,
        documentType: data?.documentType,
        documentNumber: data?.documentNumber,
        phone: data?.phone,
        photo: data?.photo,
        updatedAt: new Date(),
        enabled: true,
      },
    })

    return { success: true, data: deleteInfoUser(user) }
  } catch (err) {
    const error = 'Ocurrio un error al actualizar el usuario'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}

export const getUser = async ({
  id,
  enabled = true,
  querySearch,
  page = 1,
  rowsPerPage = 10,
} = {}) => {
  const fName = `${libName} [getUser]`

  let where = { enabled }
  if (isRowId(id)) where.id = id

  if (!isEmpty(querySearch)) {
    const searchWords = emptySpacesMadness(decodeURIComponent(querySearch)).split(' ')
    where.AND = searchWords.map((word) => ({
      OR: [
        { names: { contains: word, mode: 'insensitive' } },
        { lastNames: { contains: word, mode: 'insensitive' } },
        { email: { contains: word, mode: 'insensitive' } },
        { documentNumber: { contains: word, mode: 'insensitive' } },
        { phone: { contains: word, mode: 'insensitive' } },
      ],
    }))
  }

  let include

  const skip = (page - 1) * rowsPerPage
  const take = parseInt(rowsPerPage)

  try {
    logger.info(`${fName} Obteniendo usuario...`)
    let users = await prisma.users.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.users.count({ where })

    return { success: true, data: users, total }
  } catch (err) {
    const error = 'Ocurrio un error al obtener el usuario'
    logger.error(`${fName} ${error}`)
    console.error(err)
    return { success: false, error }
  }
}
