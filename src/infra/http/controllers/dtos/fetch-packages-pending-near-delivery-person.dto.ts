import { ApiPropertyOptional } from '@nestjs/swagger'

export class FetchPackagesPendingNearDeliveryPersonQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
  })
  page!: number

  @ApiPropertyOptional()
  district!: string
}
