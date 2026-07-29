import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Interceptor que maneja errores HTTP globales */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status >= 400 && error.status < 500) {
        const msg = error.error?.error || error.error?.message || 'Ocurrió un error';
        toast.error(msg);
      }
      return throwError(() => error);
    }),
  );
};
