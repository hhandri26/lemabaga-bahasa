import {
    HttpEvent,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
    HttpInterceptor
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ErrorIntercept implements HttpInterceptor {
    constructor(private _toastr: ToastrService) {
    }
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    console.log('HttpInterceptor', error);
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        errorMessage = `Error: ${error.error.message}`;
                    } else {
                        // server-side error
                        if (error.status === 500) {
                            errorMessage = error.error.message || 'Internal Server Error';
                            console.error('Server Error Details:', error.error);
                        } else {
                            errorMessage = error.error.message || `HTTP Error: ${error.status}`;
                        }
                    }
                    // this._toastr.error(errorMessage, 'ERROR');
                    return throwError(() => errorMessage);
                })
            );
    }
}
