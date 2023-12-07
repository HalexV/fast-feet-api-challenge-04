import { HashGenerator } from '@/domain/fast-feet/application/cryptography/hash-generator'
import { Module } from '@nestjs/common'
import { BcryptHasher } from './bcrypt-hasher'
import { HashComparer } from '@/domain/fast-feet/application/cryptography/hash-comparer'

@Module({
  providers: [
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: HashComparer, useClass: BcryptHasher },
  ],
  exports: [HashGenerator, HashComparer],
})
export class CryptographyModule {}
