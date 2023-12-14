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
import { DeliveryPersonPresenter } from '../presenters/delivery-person-presenter'
import { FetchDeliveryPeopleUseCase } from '@/domain/fast-feet/application/use-cases/fetch-delivery-people'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { FetchDeliveryPersonResponseModel } from './models/responses/fetch-delivery-person-response-model'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/delivery-people')
@Roles(Role.Admin)
export class FetchDeliveryPeopleController {
  constructor(
    private readonly fetchDeliveryPeople: FetchDeliveryPeopleUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiQuery({ name: 'page', type: 'string' })
  @ApiOkResponse({ type: FetchDeliveryPersonResponseModel })
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchDeliveryPeople.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const deliveryPeople = result.value.deliveryPeople

    return {
      deliveryPeople: deliveryPeople.map(DeliveryPersonPresenter.toHTTP),
    }
  }
}
