import jwt from 'jsonwebtoken'
import { isNull } from 'lodash'
import { DateTime } from 'luxon'
/*
 * Fuction to check if the *arg* parameter is empty no matter what king of type
 * the parameter arg is
 */
export const isEmpty = (arg) => {
  let isEmpty = false
  if (isNVL(arg)) {
    isEmpty = true
  } else if (!arg && typeof arg !== 'number' && typeof arg !== 'boolean') {
    isEmpty = true
  } else if (typeof arg === 'string' || Array.isArray(arg)) {
    isEmpty = arg.length === 0
  } else if (typeof arg === 'object') {
    isEmpty = Object.keys(arg).length === 0
  }
  return isEmpty
}

export const isNVL = (arg) => {
  return arg === null || arg === undefined || arg === ''
}

//Funcion para verificar que el string pasado si sea un correo valido
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/*
 * Function to get formatted an email address
 */
export const emailFormatter = (email) => {
  if (typeof email === 'string') {
    email = email.trim().toLowerCase()
  }
  return email
}

export const isUserActive = (user) => {
  return !isEmpty(user?.id) && user.enabled
}
/*
 * Function to build a JWT with the information provided for the User.
 * The default duration will be 24 hours
 *
 * @param {Object} user - The user id object to be used to build the JWT
 * @param {Object} duration - The duration of the JWT in seconds
 */
export const buildJWT = (user, { duration } = {}) => {
  const expiresIn = duration || parseInt(process.env.DEFAULT_TIME_JWT ?? 1) * 60 * 60

  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn,
  })
}

export const getFileExtension = (fileName) => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
}

/*
 * This is used to check if the provided UUID strings are valid.
 */
export const uuidPattern =
  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
export const uuidRegex = new RegExp(uuidPattern)

/*
 * Funcion para verificar si un ID es valido.
 */
export const isRowId = (id) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  return !isEmpty(id) && regex.test(id)
}

/*
 * Funcion para verificar si el argumento es un arreglo, si no lo es, lo convierte en uno con un solo
 * elemento.
 */
export const toArray = (arg) => {
  if (arg === undefined || arg === null) {
    return []
  }
  return Array.isArray(arg) ? arg : [arg]
}

/*
 * Funcion que transforma un string a un formato valido para busquedas en bases de datos.
 * Reemplaza los espacios multiples por uno solo y elimina los espacios al inicio y al final del
 * string.
 */
export const textForDBSearch = (text) => {
  if (typeof text !== 'string') {
    return text
  }

  const searchText = text.replace(/\s+/g, ' ').replace(/\s/g, '%').trim()
  return `%${searchText}%`
}

export const deleteInfoUser = (data) => {
  delete data?.password

  return data
}

export const validateMandatoryData = (data, fields) => {
  const missingFields = fields.filter((field) => {
    if (data[field] instanceof Date) {
      if (isNaN(data[field])) {
        return true
      }
      return false
    }
    return isEmpty(data[field])
  })
  return missingFields
}

export const getMonthFormNumber = (month) => {
  const months = {
    1: 'enero',
    2: 'febrero',
    3: 'marzo',
    4: 'abril',
    5: 'mayo',
    6: 'junio',
    7: 'julio',
    8: 'agosto',
    9: 'septiembre',
    10: 'octubre',
    11: 'noviembre',
    12: 'diciembre',
  }
  return months[month]
}

export const emptySpacesMadness = (string) => {
  return string.replace(/\s+/g, ' ').trim()
}

// funcion para formatear fecha a formato dd/mm/yyyy con luxon
export const formatDateToLuxon = (date) => {
  try {
    return DateTime.fromISO(date, { zone: 'utc' }).toFormat('dd/MM/yyyy')
  } catch (err) {
    console.error(err)
  }
}

export const hasAttributes = (arg, keys, { strictMode = true } = {}) => {
  if (typeof arg !== 'object' || isEmpty(arg) || !Array.isArray(keys) || isEmpty(keys)) {
    return false
  }
  return keys.every((key) => {
    return strictMode ? !isEmpty(arg[key]) : !isNull(arg[key])
  })
}
