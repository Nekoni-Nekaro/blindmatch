import {
  Controller, Post, Get, Body, Req, Res, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register with email & password' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password' })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user as User);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using cookie' })
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User & { refreshToken: string };
    const tokens = await this.authService.refresh(user.id, user.refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.login(req.user as User);
    res.redirect(`/auth/success?token=${tokens.accessToken}`);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
