import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const envService = app.get(EnvService)

  const config = new DocumentBuilder()
    .setTitle('Fast-Feet API')
    // .setDescription('The cats API description')
    .setVersion('1.0')
    // .addTag('cats')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = envService.get('APP_PORT')

  await app.listen(port)
}
bootstrap()
