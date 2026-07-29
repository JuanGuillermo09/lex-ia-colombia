import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot } from '@angular/router';

/** Guard que restringe rutas según el rol del usuario */
export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const requiredRoles = route.data['roles'] as string[];

  if (user && requiredRoles.includes(user.role)) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
