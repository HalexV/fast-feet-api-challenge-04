import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AuthenticateAdminController } from './controllers/authenticate-admin.controller'
import { AuthenticateAdminUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-admin'

@Module({
  imports: [CryptographyModule],
  controllers: [AuthenticateAdminController],
  providers: [AuthenticateAdminUseCase],
})
export class HttpModule {}
