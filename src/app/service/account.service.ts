import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SnackBarService } from 'service/snack-bar.service';
import { Account } from 'public/data-struct-definition';

@Injectable()
export class AccountService {
    private account_data = new BehaviorSubject<Account>(null);

    constructor(
        private _http: HttpClient,
        private _snack_bar: SnackBarService,
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
        ).subscribe(
            res => {
                if (!res['result']) {
                    if (res['status'] === 3004) {
                        this._snack_bar.show('User name exists. Please choose another.');
                    }
                } else {
                    this.data.user_name = username;
                    window.localStorage.setItem('user_name', username);
                    this._snack_bar.show('Successfully.');
                }
            },
            error => {

            });
    }

    update_user_info() {
        this._http.get('/middle/guard/auth').subscribe(
            data => {
                if (data['result'] !== 1) {
                    return false;
                } else {
                    window.localStorage.setItem('user_name', data['data']['user_name']);
                    this.data = data['data'];
                    return true;
                }
            }
        );
    }
}

