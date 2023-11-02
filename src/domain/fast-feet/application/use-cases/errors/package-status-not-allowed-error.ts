import { UseCaseError } from '@/core/errors/use-case-error'

export class PackageStatusNotAllowedError
  extends Error
  implements UseCaseError {}
