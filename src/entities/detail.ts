import { UserDetail } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDetailEntity implements UserDetail {
  @ApiProperty({ readOnly: true })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  branch: string;

  @ApiProperty({ required: true })
  userId: string;
}
