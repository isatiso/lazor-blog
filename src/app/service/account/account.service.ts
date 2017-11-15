import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Account } from 'public/data-struct-definition';

@Injectable()
export class AccountService {
    private account_data = new BehaviorSubject<Account>(null);

    constructor(
        private _http: HttpClient,
    ) { }

    set data(value: Account) {
        this.account_data.next(value);
    }

    get data() {
        return this.account_data.value;
    }

    update_username(username) {
        this._http.post(
            '/middle/user/profile',
            { name: username }
        ).subscribe(res => {
            this.data.user_name = username;
            window.localStorage.setItem('user_name', username);
        });
    }
}

