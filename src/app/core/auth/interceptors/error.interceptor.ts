import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        storage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
