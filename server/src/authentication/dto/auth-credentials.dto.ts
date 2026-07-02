import { IsNotEmpty, IsString } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @IsNotEmpty({ message: 'שם משתמש הוא שדה חובה' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'סיסמה היא שדה חובה' })
  password!: string;
}
