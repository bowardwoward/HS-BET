import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty({ readOnly: true })
  id: string;

  @ApiProperty({ required: true })
  accountNumber: string;

  @ApiProperty({ required: true })
  mobile: string;

  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;

  @ApiProperty({ required: true })
  email: string;
}
