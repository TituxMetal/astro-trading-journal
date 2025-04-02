import { z } from 'zod'

export const brokerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required.'),
  accountNumber: z.string().optional(),
  currency: z.string().min(1, 'Currency is required.')
})

export const createBrokerSchema = brokerSchema.omit({ id: true })
export const updateBrokerSchema = brokerSchema.partial()

export type CreateBrokerSchema = z.infer<typeof createBrokerSchema>
export type UpdateBrokerSchema = z.infer<typeof updateBrokerSchema>
