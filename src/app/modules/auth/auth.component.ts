import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AccountService } from 'service/account.service';
import { SnackBarService } from 'service/snack-bar.service';
import { NavButtonService } from 'service/nav-button.service';
import { Account } from 'public/data-struct-definition';

@Component({
    selector: 'la-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    animations: [
        trigger('tab', [
            state('1', style({
                opacity: 1,
            })),
            state('0', style({
                opacity: 0,
            })),
            transition('* <=> *', animate('300ms ease-out'))
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
        private _active_route: ActivatedRoute,
        private _snack_bar: SnackBarService,
        private _account: AccountService,
        private _nav_button: NavButtonService,
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
        this._nav_button.button_list = [];
    }

    ngOnDestroy() {
        this.auth_exists = 'inactive';
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
                    this._account.data = data['data'];
                    this._active_route.queryParams.subscribe(
                        params => {
                            this._router.navigate([params['backurl'] || '/home']);
                        });
                } else if (data['status'] === 3002) {
                    this._snack_bar.show('Inactivated account, connect author to active your account.', 'OK');
                    return false;
                } else {
                    this._snack_bar.show(data['msg'], 'OK');
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
            this._snack_bar.show(message, 'OK');
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
                    this._snack_bar.show('Sign Up Successfully.', 'OK');
                    this.tab_select = 0;
                } else {
                    this._snack_bar.show(data['msg'], 'OK');
                    return false;
                }
            });
    }
}
