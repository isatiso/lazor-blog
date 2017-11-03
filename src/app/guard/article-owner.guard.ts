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
export class ArticleOwnerGuard implements CanActivate {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        public snack_bar: MatSnackBar,
        public account: AccountService
    ) { }

    raiseSnackBar(message: string, action_name: string, action) {
        const snack_ref = this.snack_bar.open(
            message,
            action_name,
            {
                duration: 2000
            }
        );
        snack_ref.onAction().subscribe(action);
    }

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
                    this.raiseSnackBar(message, 'OK', () => {
                    });
                    return false;
                } else {
                    return true;
                }
            },
        ).catch(
            error => {
                this._router.navigate(['/auth']);
                this.account.data = null;
                window.sessionStorage.setItem('user_name', null);
                return new Observable<boolean>();
            },
        );
    }
}
