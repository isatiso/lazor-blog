import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { NoticeService } from 'service/notice.service';
import { AccountService } from 'service/account.service';
import { ArticleDatabaseService } from 'service/article-database.service';

@Injectable()

export class LeaveGuard implements CanDeactivate<null> {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _account: AccountService,
        private _article_db: ArticleDatabaseService,
        private _notice: NoticeService,
    ) { }

    canDeactivate(
        component: null,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (this._article_db.article_status === 'modified') {
            this._notice.bar('Please save your article.', 'OK');
            return false;
        } else {
            return true;
        }
    }

}
