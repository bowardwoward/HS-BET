import { UserAddress } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserAddressEntity implements UserAddress {
  @ApiProperty({ readOnly: true })
  id: string;

  @ApiProperty()
  street: string | null;

  @ApiProperty()
  barangay: string | null;

  @ApiProperty()
  city: string | null;

  @ApiProperty()
  province: string | null;

  @ApiProperty()
  region: string | null;

  @ApiProperty()
  zipCode: string | null;

  @ApiProperty()
  country: string | null;

  @ApiProperty({ required: true })
  userId: string;
}
