import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { extractTokenFromHeader } from '../../helpers';
import { PrismaService } from '@app/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();

    if (!request.user) {
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

    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
