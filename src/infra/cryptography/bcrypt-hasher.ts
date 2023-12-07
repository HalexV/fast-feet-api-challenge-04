import { hash, compare } from 'bcryptjs'
import { HashComparer } from '@/domain/fast-feet/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/fast-feet/application/cryptography/hash-generator'

export class BcryptHasher implements HashGenerator, HashComparer {
  private readonly HASH_SALT_LENGTH = 8

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
