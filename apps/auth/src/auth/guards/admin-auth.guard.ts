import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { extractTokenFromHeader } from '../../helpers';
import { PrismaService } from '../../../../../libs/common/src/prisma/prisma.service';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const isTokenValid = await this.prisma.tokens.findFirst({
      select: { is_revoked: true },
      where: { token },
    });

    if (isTokenValid?.is_revoked) {
      throw new UnauthorizedException();
    }

    const userData = await this.prisma.users.findUnique({
      where: { id: user.userId, is_activated: true },
      include: {
        roles: true,
      },
    });

    if (userData && userData.roles.some((role) => role.role_name === 'ADMIN')) {
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
}
