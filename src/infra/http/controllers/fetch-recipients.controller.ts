import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Query,
} from '@nestjs/common'
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { FetchRecipientsUseCase } from '@/domain/fast-feet/application/use-cases/fetch-recipients'
import { FetchRecipientsResponseModel } from './models/responses/fetch-recipients-model'
import { RecipientPresenter } from '../presenters/recipient-presenter'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/recipients')
@Roles(Role.Admin)
export class FetchRecipientsController {
  constructor(private readonly fetchRecipients: FetchRecipientsUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'page', type: 'string' })
  @ApiOkResponse({ type: FetchRecipientsResponseModel })
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchRecipients.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const recipients = result.value.recipients

    return {
      recipients: recipients.map(RecipientPresenter.toHTTP),
    }
  }
}
