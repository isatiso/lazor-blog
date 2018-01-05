import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NoticeService } from 'service/notice.service';
import { Account } from 'public/data-struct-definition';

@Injectable()
export class AccountService {
    private account_data = new BehaviorSubject<Account>(null);
    public pattern = {
        email: /^([\w-.]+)@([\w-]+)(\.([\w-]+))+$/,
        password: /^[0-9A-Za-z`~!@#$%^&*()_+\-=\{\}\[\]:;"'<>,.\\|?/ ]{6,24}$/,
        nickname: /^[\w\-\u4e00-\u9fa5]{1,12}$/,
    };

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _active_route: ActivatedRoute,
        private _notice: NoticeService,
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
                        this._notice.bar('User name exists. Please choose another.');
                    }
                } else {
                    this.data.user_name = username;
                    window.localStorage.setItem('user_name', username);
                    this._notice.bar('Successfully.');
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

    check_log() {
        this._http.get('/middle/guard/auth').subscribe(
            data => {
                if (data['result'] === 1) {
                    window.localStorage.setItem('user_name', data['data']['user_name']);
                    this.data = data['data'];
                    this._router.navigate(['/home']);
                }
            },
        );
    }

    sign_in(data) {

        data.name = data.name.trim();

        this._http.post(
            '/middle/user', {
                name: data.name,
                password: data.password
            }).subscribe(
            res => {
                if (res['result'] === 1) {
                    this.data = res['data'];
                    this._active_route.queryParams.subscribe(
                        params => {
                            this._router.navigate([params['backurl'] || '/home']);
                        });
                } else if (res['status'] === 3002) {
                    this._notice.bar('Inactivated account, connect author to active your account.', 'OK');
                    return false;
                } else {
                    this._notice.bar(res['msg'], 'OK');
                    return false;
                }
            });
    }

    sign_up(data, callback: (res: boolean) => any) {
        data.email = data.email.trim();

        let message = '';
        let not_regular = null;
        if (!data.email.match(this.pattern.email)) {
            message = 'Invalid Email.';
            not_regular = true;
        } else if (!data.password.match(this.pattern.password)) {
            message = 'Invalid Password.';
            not_regular = true;
        }
        if (not_regular) {
            this._notice.bar(message, 'OK');
            return false;
        }
        this._http.put(
            '/middle/user',
            {
                username: data.username,
                email: data.email,
                password: data.password
            }).subscribe(
            res => {
                if (res['result'] === 1) {
                    this._notice.bar('Sign Up Successfully.', 'OK');
                    // this.tab_select = 0;
                } else {
                    this._notice.bar(res['msg'], 'OK');
                    return false;
                }
            });
    }

    relogin() {
        this._notice.input({
            input_list: [{
                name: 'email_or_name',
                placeholder: '邮箱/用户名',
                value: '',
                required: true,
            }, {
                name: 'password',
                placeholder: '密码',
                value: '',
                required: true,
                type: 'password'
            }]
        }, res => {
            if (!res) { return; }
            this._http.post(
                '/middle/user',
                {
                    name: res.email_or_name.value,
                    password: res.password.value
                }).subscribe(
                data => {
                    if (data['result'] === 1) {
                        this.data = data['data'];
                        this._notice.bar('登陆成功，请重新进行保存操作', 'OK');
                    } else if (data['status'] === 3002) {
                        this._notice.bar('账户未激活，联系作者以激活账户', 'OK');
                    } else {
                        this._notice.bar(data['msg'], 'OK');
                    }
                });
        });
    }
}

