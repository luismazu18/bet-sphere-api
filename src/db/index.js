import { PrismaClient } from '@prisma/client'
import logger from '../util/logger.js'

// Instancia del cliente de Prisma para acceder a la base de datos
logger.info('[startingService] Inicializando el cliente de Prisma...')
export const prisma = new PrismaClient({ log: ['info'] })
