import { generateIdFromEntropySize } from 'lucia'
import { Argon2id } from 'oslo/password'
import { prisma } from '~/lib/prisma'

export const findUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { authMethods: true }
  })

  if (!user || !user.authMethods[0]?.hashedPassword) {
    throw new Error('Invalid Credentials')
  }

  return user
}

export const verifyPassword = async (hashedPassword: string, inputPassword: string) => {
  const validPassword = await new Argon2id().verify(hashedPassword, inputPassword)

  if (!validPassword) {
    throw new Error('Invalid Credentials')
  }

  return validPassword
}

export const createNewUser = async (username: string, password: string) => {
  const hashedPassword = await new Argon2id().hash(password)
  const userId = generateIdFromEntropySize(15)

  const [user, userAuth] = await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        username
      }
    }),
    prisma.userAuth.create({
      data: {
        id: generateIdFromEntropySize(15),
        hashedPassword,
        userId
      }
    })
  ])

  if (!user || !userAuth) {
    throw new Error('Failed to create user')
  }

  return {
    id: user.id,
    username: user.username
  }
}
