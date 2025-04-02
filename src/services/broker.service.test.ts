import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '~/lib/prisma'
import {
  createBroker,
  deleteBroker,
  getAllBrokers,
  getBrokerById,
  updateBroker
} from './broker.service'

vi.mock('~/lib/prisma', () => ({
  prisma: {
    broker: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}))

describe('Broker Service', () => {
  const mockBroker = {
    id: '1',
    name: 'Test Broker',
    accountNumber: '123456',
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBroker', () => {
    it('should create a broker successfully', async () => {
      const brokerData = {
        name: 'Test Broker',
        accountNumber: '123456',
        currency: 'USD'
      }

      vi.mocked(prisma.broker.create).mockResolvedValue(mockBroker)

      const result = await createBroker(brokerData)

      expect(prisma.broker.create).toHaveBeenCalledWith({ data: brokerData })
      expect(result).toEqual(mockBroker)
    })

    it('should throw error when broker name already exists', async () => {
      const brokerData = {
        name: 'Existing Broker',
        currency: 'USD'
      }

      const error = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '1.0.0'
      })

      vi.mocked(prisma.broker.create).mockRejectedValue(error)

      await expect(createBroker(brokerData)).rejects.toThrow(
        `A broker with the name '${brokerData.name}' already exists.`
      )
    })
  })

  describe('getAllBrokers', () => {
    it('should return all brokers', async () => {
      const mockBrokers = [mockBroker]
      vi.mocked(prisma.broker.findMany).mockResolvedValue(mockBrokers)

      const result = await getAllBrokers()

      expect(prisma.broker.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockBrokers)
    })
  })

  describe('getBrokerById', () => {
    it('should return broker when found', async () => {
      vi.mocked(prisma.broker.findUnique).mockResolvedValue(mockBroker)

      const result = await getBrokerById('1')

      expect(prisma.broker.findUnique).toHaveBeenCalledWith({ where: { id: '1' } })
      expect(result).toEqual(mockBroker)
    })

    it('should throw error when broker not found', async () => {
      vi.mocked(prisma.broker.findUnique).mockResolvedValue(null)

      await expect(getBrokerById('1')).rejects.toThrow('Broker with ID 1 not found')
    })
  })

  describe('updateBroker', () => {
    it('should update broker successfully', async () => {
      const brokerUpdates = {
        name: 'Updated Broker',
        currency: 'EUR'
      }

      const updatedMockBroker = {
        ...mockBroker,
        ...brokerUpdates,
        updatedAt: new Date()
      }

      vi.mocked(prisma.broker.update).mockResolvedValue(updatedMockBroker)

      const result = await updateBroker('1', brokerUpdates)

      expect(prisma.broker.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: brokerUpdates
      })
      expect(result).toEqual(updatedMockBroker)
    })

    it('should throw error when broker not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '1.0.0'
      })

      vi.mocked(prisma.broker.update).mockRejectedValue(error)

      await expect(updateBroker('1', { name: 'Updated Broker' })).rejects.toThrow(
        'Broker with ID 1 not found'
      )
    })
  })

  describe('deleteBroker', () => {
    it('should delete broker successfully', async () => {
      vi.mocked(prisma.broker.delete).mockResolvedValue(mockBroker)

      const result = await deleteBroker('1')

      expect(prisma.broker.delete).toHaveBeenCalledWith({ where: { id: '1' } })
      expect(result).toEqual(mockBroker)
    })

    it('should throw error when broker not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '1.0.0'
      })

      vi.mocked(prisma.broker.delete).mockRejectedValue(error)

      await expect(deleteBroker('1')).rejects.toThrow('Broker with ID 1 not found')
    })
  })
})
