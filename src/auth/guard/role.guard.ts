import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private roles: string[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role_id } = request.user;
    const getRole: string =
      role_id === 1 ? 'Admin' : role_id === 2 ? 'Pet Owner' : 'Vet';
    return this.roles.includes(getRole);
  }
}
