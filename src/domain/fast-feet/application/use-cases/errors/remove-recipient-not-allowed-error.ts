import { UseCaseError } from '@/core/errors/use-case-error'

export class RemoveRecipientNotAllowedError
  extends Error
  implements UseCaseError {}
