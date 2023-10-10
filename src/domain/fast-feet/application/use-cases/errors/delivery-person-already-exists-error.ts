import { UseCaseError } from '@/core/errors/use-case-error'

export class DeliveryPersonAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Delivery person '${identifier}' already exists.`)
  }
}
