import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { admin: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { admin: { findUnique: jest.fn() } };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    const admin = {
      id: 'admin-1',
      email: 'admin@test.com',
      passwordHash: '$2b$10$hashedpassword',
    };

    it('should return JWT for valid credentials', async () => {
      prisma.admin.findUnique.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login('admin@test.com', 'password123');

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        admin.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'admin-1',
        email: 'admin@test.com',
      });
      expect(result).toEqual({ access_token: 'jwt-token-123' });
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.login('unknown@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.admin.findUnique.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('admin@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
