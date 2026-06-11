import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: AuthCredentialsDto) {
    return this.authenticationService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  login(@Body() dto: AuthCredentialsDto) {
    return this.authenticationService.login(dto);
  }
}
