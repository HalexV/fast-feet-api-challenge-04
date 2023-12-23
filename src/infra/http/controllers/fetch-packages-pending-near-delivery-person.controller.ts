import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { PackageWithRecipientPresenter } from '../presenters/package-with-recipient-presenter'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { FetchPackagesPendingNearDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/fetch-packages-pending-near-delivery-person'
import { FetchPackagesPendingNearDeliveryPersonQueryDto } from './dtos/fetch-packages-pending-near-delivery-person.dto'
import { FetchPackagesPendingNearDeliveryPersonResponseModel } from './models/responses/fetch-packages-pending-near-delivery-person-response-model'

const fetchPackagesPendingNearDeliveryPersonQueryParamSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  district: z.string().optional(),
})

const queryValidationPipe = new ZodValidationPipe(
  fetchPackagesPendingNearDeliveryPersonQueryParamSchema,
)

type FetchPackagesPendingNearDeliveryPersonQueryParamSchema = z.infer<
  typeof fetchPackagesPendingNearDeliveryPersonQueryParamSchema
>

@Controller('/packages/pending')
@Roles(Role.DeliveryPerson)
export class FetchPackagesPendingNearDeliveryPersonController {
  constructor(
    private readonly fetchPackagesPendingNearDeliveryPerson: FetchPackagesPendingNearDeliveryPersonUseCase,
  ) {}

  @Get()
  @ApiQuery({ type: FetchPackagesPendingNearDeliveryPersonQueryDto })
  @ApiOkResponse({
    type: FetchPackagesPendingNearDeliveryPersonResponseModel,
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(queryValidationPipe)
    query: FetchPackagesPendingNearDeliveryPersonQueryParamSchema,
  ) {
    const deliveryPersonId = user.sub
    const { page, district } = query

    const result = await this.fetchPackagesPendingNearDeliveryPerson.execute({
      page,
      deliveryPersonId,
      district,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const pkgs = result.value.pkgs

    return {
      packages: pkgs.map(PackageWithRecipientPresenter.toHTTP),
    }
  }
}
