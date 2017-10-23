import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

import { Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private snack_bar: MatSnackBar
    ) { }

    raiseSnackBar(message: string, action_name: string, action) {
        const snack_ref = this.snack_bar.open(
            message,
            action_name,
            {
                duration: 2000,
            }
        );
        snack_ref.onAction().subscribe(action);
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        this._http.get('/middle/guard/auth').subscribe(
            data => {
                if (data['result'] !== 1) {
                    this._router.navigate(['/auth']);
                    console.log(data);
                    return false;
                }
            });
        return true;
    }
}
