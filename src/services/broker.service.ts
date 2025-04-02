import { Prisma, type Broker } from '@prisma/client'
import { prisma } from '~/lib/prisma'

/**
 * Creates a new broker in the database
 * @param brokerData The broker data to create
 * @returns The created broker
 * @throws Error if the broker already exists
 */
export const createBroker = async (brokerData: {
  name: string
  accountNumber?: string
  currency: string
}): Promise<Broker> => {
  try {
    return await prisma.broker.create({ data: brokerData })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error(`A broker with the name '${brokerData.name}' already exists.`)
      }
    }
    throw error
  }
}

/**
 * Retrieves all brokers from the database
 * @returns Array of all brokers
 */
export const getAllBrokers = async (): Promise<Broker[]> => {
  return prisma.broker.findMany()
}

/**
 * Retrieves a specific broker by ID
 * @param brokerId The ID of the broker to retrieve
 * @returns The broker
 */
export const getBrokerById = async (brokerId: string): Promise<Broker> => {
  const broker = await prisma.broker.findUnique({ where: { id: brokerId } })

  if (!broker) {
    throw new Error(`Broker with ID ${brokerId} not found`)
  }

  return broker
}

/**
 * Updates a broker's information
 * @param brokerId The ID of the broker to update
 * @param brokerUpdates The data to update
 * @returns The updated broker
 */
export const updateBroker = async (
  brokerId: string,
  brokerUpdates: { name?: string; accountNumber?: string; currency?: string }
): Promise<Broker> => {
  try {
    return await prisma.broker.update({
      where: { id: brokerId },
      data: brokerUpdates
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error(`Broker with ID ${brokerId} not found`)
      }
    }

    throw error
  }
}

/**
 * Deletes a broker from the database
 * @param brokerId The ID of the broker to delete
 * @returns The deleted broker
 */
export const deleteBroker = async (brokerId: string): Promise<Broker> => {
  try {
    return await prisma.broker.delete({ where: { id: brokerId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error(`Broker with ID ${brokerId} not found`)
      }
    }

    throw error
  }
}
