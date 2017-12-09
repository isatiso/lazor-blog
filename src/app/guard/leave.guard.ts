import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { SnackBarService } from 'service/snack-bar.service';
import { AccountService } from 'service/account.service';
import { ArticleDatabaseService } from 'service/article-database.service';

@Injectable()

export class LeaveGuard implements CanDeactivate<null> {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _account: AccountService,
        private _article_db: ArticleDatabaseService,
        private _snack_bar: SnackBarService,
    ) { }

    canDeactivate(
        component: null,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (this._article_db.article_status === 'modified') {
            this._snack_bar.show('Please save your article.', 'OK');
            return false;
        } else {
            return true;
        }
    }

}
