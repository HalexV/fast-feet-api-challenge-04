import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AuthenticateAdminController } from './controllers/authenticate-admin.controller'
import { AuthenticateAdminUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-admin'
import { AuthenticateDeliveryPersonController } from './controllers/authenticate-delivery-person.controller'
import { AuthenticateDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-delivery-person'

@Module({
  imports: [CryptographyModule],
  controllers: [
    AuthenticateAdminController,
    AuthenticateDeliveryPersonController,
  ],
  providers: [AuthenticateAdminUseCase, AuthenticateDeliveryPersonUseCase],
})
export class HttpModule {}
