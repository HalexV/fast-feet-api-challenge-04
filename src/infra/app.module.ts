import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { DatabaseModule } from './database/database.module'
import { EnvService } from './env/env.service'
import { CryptographyModule } from './cryptography/cryptography.module'
import { RegisterDefaultAdminUseCase } from '@/domain/fast-feet/application/use-cases/register-default-admin'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    DatabaseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        connectionString: envService.get('POSTGRES_URL'),
      }),
    }),
    CryptographyModule,
    AuthModule,
  ],
  providers: [RegisterDefaultAdminUseCase],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name)

  constructor(
    private readonly registerDefaultAdmin: RegisterDefaultAdminUseCase,
    private readonly envService: EnvService,
  ) {}

  async onApplicationBootstrap() {
    const result = await this.registerDefaultAdmin.execute({
      address: 'default',
      city: 'default',
      state: 'AC',
      cpf: '00000000000',
      district: 'default',
      email: 'default@default.com',
      name: 'default',
      password: this.envService.get('DEFAULT_ADMIN_PASSWORD'),
    })

    if (result.isRight()) {
      if (!result.value) {
        this.logger.log('Default admin already created')
        return
      }

      this.logger.log('Default admin created')
    }
  }
}
