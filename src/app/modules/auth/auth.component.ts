import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AccountService } from 'service/account/account.service';
import { Account } from 'public/data-struct-definition';

@Component({
    selector: 'la-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    animations: [
        trigger('tab', [
            state('0', style({
                color: '#000000',
                opacity: 1,
            })),
            transition('void => *', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('* => active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
    ]
})
export class AuthComponent implements OnInit, OnDestroy {
    auth_exists = 'active';
    tab_select = 0;
    dynamic_height = true;
    public sign_in_data = {
        name: '',
        password: '',
    };

    public sign_up_data = {
        username: '',
        email: '',
        password: '',
    };

    public pattern = {
        email: /^([\w-.]+)@([\w-]+)(\.([\w-]+))+$/,
        password: /^[0-9A-Za-z`~!@#$%^&*()_+\-=\{\}\[\]:;"'<>,.\\|?/ ]{6,24}$/,
        nickname: /^[\w\-\u4e00-\u9fa5]{1,12}$/,
    };

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _snack_bar: MatSnackBar,
        private _account: AccountService,
    ) { }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this.auth_exists = 'active';
        this._http.get('/middle/guard/auth').subscribe(
            data => {
                if (data['result'] === 1) {
                    window.localStorage.setItem('user_name', data['data']['user_name']);
                    this._account.data = data['data'];
                    this._router.navigate(['/home']);
                }
            },
        );
    }

    ngOnDestroy() {
        this.auth_exists = 'inactive';
    }

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

    select_change(event) {
        this.tab_select = event;
    }

    signIn(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }
        this.sign_in_data.name = this.sign_in_data.name.trim();

        this._http.post(
            '/middle/user',
            {
                name: this.sign_in_data.name,
                password: this.sign_in_data.password
            }).subscribe(
            data => {
                if (data['result'] === 1) {
                    this._router.navigate(['/home']);
                    this._account.data = data['data'];
                } else {
                    this.raiseSnackBar(data['msg'], 'OK', () => {
                    });
                    return false;
                }
            });
    }

    signUp(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }

        this.sign_up_data.email = this.sign_up_data.email.trim();
        let message = '';
        let not_regular = null;
        if (!this.sign_up_data.email.match(this.pattern.email)) {
            message = 'Invalid Email.';
            not_regular = true;
        } else if (!this.sign_up_data.password.match(this.pattern.password)) {
            message = 'Invalid Password.';
            not_regular = true;
        }
        if (not_regular) {
            this.raiseSnackBar(message, 'OK', () => {
            });
            return false;
        }
        this._http.put(
            '/middle/user',
            {
                username: this.sign_up_data.username,
                email: this.sign_up_data.email,
                password: this.sign_up_data.password
            }).subscribe(
            data => {
                if (data['result'] === 1) {
                    this.raiseSnackBar('Sign Up Successfully.', 'OK', () => {
                    });
                    this.tab_select = 0;
                } else {
                    this.raiseSnackBar(data['msg'], 'OK', () => {
                    });
                    return false;
                }
            });
    }
}
