import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { DatabaseModule } from './database/database.module'
import { EnvService } from './env/env.service'
import { CryptographyModule } from './cryptography/cryptography.module'
import { RegisterDefaultAdminUseCase } from '@/domain/fast-feet/application/use-cases/register-default-admin'
import { AuthModule } from './auth/auth.module'
import { HttpModule } from './http/http.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { EventsModule } from './events/events.module'

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
    MailerModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        transport: {
          host: envService.get('EMAIL_HOST'),
          port: envService.get('EMAIL_PORT'),
          secure: false,
          auth: {
            user: envService.get('EMAIL_USERNAME'),
            pass: envService.get('EMAIL_PASSWORD'),
          },
        },
      }),
    }),
    CryptographyModule,
    AuthModule,
    HttpModule,
    EventsModule,
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
