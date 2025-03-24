import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '~/lib/prisma'
import { createNewUser, findUserByUsername, verifyPassword } from './auth.service'

// Mocks
const mockUserCreate = vi.fn()
const mockUserAuthCreate = vi.fn()
const mockTransaction = vi.fn()

vi.mock('~/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn().mockImplementation(args => mockUserCreate(args))
    },
    userAuth: {
      create: vi.fn().mockImplementation(args => mockUserAuthCreate(args))
    },
    $transaction: vi.fn().mockImplementation(args => mockTransaction(args))
  }
}))

// Mock hash and verify methods
const verifyMock = vi.fn()
const hashMock = vi.fn()

vi.mock('oslo/password', () => ({
  Argon2id: vi.fn().mockImplementation(() => ({
    verify: verifyMock,
    hash: hashMock
  }))
}))

// Mock lucia with a mocked function that can be reset between tests
const generateIdMock = vi.fn()
vi.mock('lucia', () => ({
  generateIdFromEntropySize: (size: number) => generateIdMock(size)
}))

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    generateIdMock.mockReset()
    verifyMock.mockReset()
    hashMock.mockReset()
    mockUserCreate.mockReset()
    mockUserAuthCreate.mockReset()
    mockTransaction.mockReset()
  })

  describe('findUserByUsername', () => {
    it('should return user when valid username is provided', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        authMethods: [{ hashedPassword: 'hashed-password' }]
      }

      prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser)

      const result = await findUserByUsername('testuser')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        include: { authMethods: true }
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user is not found', async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue(null)

      await expect(findUserByUsername('nonexistent')).rejects.toThrow('Invalid Credentials')
    })

    it('should throw error when user has no authMethods with hashedPassword', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        authMethods: []
      }

      prisma.user.findUnique = vi.fn().mockResolvedValue(mockUser)

      await expect(findUserByUsername('testuser')).rejects.toThrow('Invalid Credentials')
    })
  })

  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      verifyMock.mockResolvedValue(true)

      const result = await verifyPassword('hashed-password', 'valid-password')

      expect(verifyMock).toHaveBeenCalledWith('hashed-password', 'valid-password')
      expect(result).toBe(true)
    })

    it('should throw error for invalid password', async () => {
      verifyMock.mockResolvedValue(false)

      await expect(verifyPassword('hashed-password', 'invalid-password')).rejects.toThrow(
        'Invalid Credentials'
      )
    })
  })

  describe('createNewUser', () => {
    it('should create a new user with hashed password', async () => {
      const username = 'newuser'
      const password = 'password123'
      const hashedPassword = 'hashed-password-123'
      const userId = 'generated-user-id'
      const authId = 'generated-auth-id'

      hashMock.mockResolvedValue(hashedPassword)
      generateIdMock.mockReturnValueOnce(userId).mockReturnValueOnce(authId)

      const mockCreatedUser = {
        id: userId,
        username
      }

      // Mock the transaction to return the created user and auth
      mockTransaction.mockResolvedValue([mockCreatedUser, { id: authId }])

      const result = await createNewUser(username, password)

      expect(hashMock).toHaveBeenCalledWith(password)
      expect(generateIdMock).toHaveBeenCalledWith(15)

      // Verify transaction was called with an array containing two operations
      expect(mockTransaction).toHaveBeenCalled()
      const transactionArgs = mockTransaction.mock.calls[0][0]
      expect(Array.isArray(transactionArgs)).toBe(true)
      expect(transactionArgs.length).toBe(2)

      expect(result).toEqual({
        id: userId,
        username
      })
    })

    it('should throw error when user is null after transaction', async () => {
      const password = 'password123'
      const hashedPassword = 'hashed-password-123'

      hashMock.mockResolvedValue(hashedPassword)
      generateIdMock.mockReturnValueOnce('userId').mockReturnValueOnce('authId')

      // Mock transaction to return null for user (first item)
      mockTransaction.mockResolvedValue([null, { id: 'authId' }])

      await expect(createNewUser('newuser', password)).rejects.toThrow('Failed to create user')
    })

    it('should throw error when userAuth is null after transaction', async () => {
      const username = 'newuser'
      const password = 'password123'
      const hashedPassword = 'hashed-password-123'
      const userId = 'userId'

      hashMock.mockResolvedValue(hashedPassword)
      generateIdMock.mockReturnValueOnce(userId).mockReturnValueOnce('authId')

      const mockCreatedUser = {
        id: userId,
        username
      }

      // Mock transaction to return null for userAuth (second item)
      mockTransaction.mockResolvedValue([mockCreatedUser, null])

      await expect(createNewUser(username, password)).rejects.toThrow('Failed to create user')
    })

    it('should throw error when transaction fails', async () => {
      hashMock.mockResolvedValue('hashed-password')
      generateIdMock.mockReturnValue('some-id')

      // Mock transaction to throw an error
      mockTransaction.mockRejectedValue(new Error('Database error'))

      await expect(createNewUser('newuser', 'password123')).rejects.toThrow()
    })
  })
})
