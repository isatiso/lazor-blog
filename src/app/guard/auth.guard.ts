import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';

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
        private _account: AccountService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return this._http.get('/middle/guard/auth').map(
            data => {
                if (data['result'] !== 1) {
                    const params: NavigationExtras = {
                        queryParams: { 'backurl': state.url },
                    };
                    this._router.navigate(['/auth'], params);
                    window.localStorage.setItem('user_name', null);
                    this._account.data = null;
                    return false;
                } else {
                    window.localStorage.setItem('user_name', data['data']['user_name']);
                    this._account.data = data['data'];
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
