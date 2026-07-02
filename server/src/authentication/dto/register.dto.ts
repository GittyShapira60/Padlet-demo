import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'שם משתמש חייב להכיל לפחות 3 תווים' })
  @MaxLength(15, { message: 'שם משתמש לא יכול לעלות על 15 תווים' })
  username!: string;

  @IsString()
  @MinLength(6, { message: 'סיסמה חייבת להכיל לפחות 6 תווים' })
  @MaxLength(15, { message: 'סיסמה לא יכולה לעלות על 15 תווים' })
  @Matches(/[!@#$%^&*]/, {
    message: 'סיסמה חייבת להכיל לפחות סימן אחד מ: ! @ # $ % ^ & *',
  })
  password!: string;
}
