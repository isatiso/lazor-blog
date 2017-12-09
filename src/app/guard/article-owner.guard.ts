import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AccountService } from 'service/account.service';
import { SnackBarService } from 'service/snack-bar.service';

@Injectable()
export class ArticleOwnerGuard implements CanActivate {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _snack_bar: SnackBarService,
        private _account: AccountService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (next.params.id === 'new-article') {
            return true;
        }

        return this._http.get('/middle/guard/owner?article_id=' + next.params.id).map(
            data => {
                if (data['result'] !== 1) {
                    const message = 'You can\'t edit other\'s article.';
                    this._snack_bar.show(message, 'OK');
                    return false;
                } else {
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
