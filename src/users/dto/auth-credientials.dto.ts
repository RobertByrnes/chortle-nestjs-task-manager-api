import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  // Password must contain at least one uppercase letter, one lowercase letter, one number or special character, and at least 8 characters
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is weak'
  })
  password: string;

  @IsString()
  @IsEmail()
  email: string;
}
