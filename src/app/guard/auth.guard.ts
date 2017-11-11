import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AccountService } from 'service/account/account.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _snack_bar: MatSnackBar,
        private _account: AccountService
    ) { }

    raiseSnackBar(message: string, action_name: string, action) {
        const snack_ref = this._snack_bar.open(
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
        // const result = new BehaviorSubject<boolean>();
        const url = state.url;

        return this._http.get('/middle/guard/auth').map(
            data => {
                if (data['result'] !== 1) {
                    this._router.navigate(['/auth']);
                    window.localStorage.setItem('user_name', null);
                    this._account.data = null;
                    return false;
                } else {
                    window.localStorage.setItem('user_name', data['data']['user_name']);
                    this._account.data = data['data'];
                    console.log(this._account.data);
                    return true;
                }
            },
        ).catch(
            error => {
                this._router.navigate(['/auth']);
                this._account.data = null;
                window.localStorage.setItem('user_name', null);
                return new Observable<boolean>();
            },
        );
    }
}
