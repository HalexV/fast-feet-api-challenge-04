import { HashComparer } from '@/domain/fast-feet/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/fast-feet/application/cryptography/hash-generator'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return `${plain}$hashed`
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const hashed = `${plain}$hashed`

    return hashed === hash
  }
}
