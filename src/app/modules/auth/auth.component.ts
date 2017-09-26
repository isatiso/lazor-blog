import { Component, OnInit } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'la-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

    public sign_in_data = {
        email: '',
        password: '',
    };

    public pattern = {
        email: /^([\w-]+)@([\w-]+)(\.([\w-]+))+$/,
        password: /^[0-9A-Za-z`~!@#$%^&*()_+\-=\{\}\[\]:;"'<>,.\\|?/ ]{6,24}$/,
        nickname: /^[\w\-\u4e00-\u9fa5]{1,24}$/,
    };

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private snack_bar: MdSnackBar,
    ) { }

    ngOnInit() {
    }

    raiseSnackBar(message: string, action_name: string, action) {
        const snack_ref = this.snack_bar.open(
            message,
            action_name,
            {
                duration: 2000,
            }
        );
        snack_ref.onAction().subscribe(action);
    }

    signIn(event) {
        if (event && event.key !== 'Enter') {
            return event;
        }

        this.sign_in_data.email = this.sign_in_data.email.trim();
        let message = '';
        let not_regular = false;
        if (!this.sign_in_data.email.match(this.pattern.email)) {
            message = 'Invalid Email.';
            not_regular = true;
        } else if (!this.sign_in_data.password.match(this.pattern.password)) {
            message = 'Invalid Password.';
            not_regular = true;
        }
        if (not_regular) {
            this.raiseSnackBar(message, 'OK', () => {
                console.log('The snack-bar action was triggered!');
            });
            return false;
        }
        const result = this._http.post(
            '/middle/account/signin',
            {
                email: this.sign_in_data.email,
                password: this.sign_in_data.password
            });
        result.subscribe(
            data => {
                if (data['result'] === 1) {
                    this._router.navigate(['/home']);
                } else {
                    this.raiseSnackBar(data['msg'], 'OK', () => {
                        console.log('Got it.');
                    });
                    console.log(data);
                    return false;
                }
            });
    }
}
