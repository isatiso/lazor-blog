import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'la-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

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
        email: /^([\w-]+)@([\w-]+)(\.([\w-]+))+$/,
        password: /^[0-9A-Za-z`~!@#$%^&*()_+\-=\{\}\[\]:;"'<>,.\\|?/ ]{6,24}$/,
        nickname: /^[\w\-\u4e00-\u9fa5]{1,24}$/,
    };

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private snack_bar: MatSnackBar,
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

    select_change(event) {
        this.tab_select = event;
    }

    signIn(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }
        console.log('get in sign in.');
        this.sign_in_data.name = this.sign_in_data.name.trim();

        const result = this._http.post(
            '/middle/user',
            {
                name: this.sign_in_data.name,
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

    signUp(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }

        this.sign_up_data.email = this.sign_up_data.email.trim();
        let message = '';
        let not_regular = false;
        if (!this.sign_up_data.email.match(this.pattern.email)) {
            message = 'Invalid Email.';
            not_regular = true;
        } else if (!this.sign_up_data.password.match(this.pattern.password)) {
            message = 'Invalid Password.';
            not_regular = true;
        }
        if (not_regular) {
            this.raiseSnackBar(message, 'OK', () => {
                console.log('The snack-bar action was triggered!');
            });
            return false;
        }
        const result = this._http.put(
            '/middle/user',
            {
                username: this.sign_up_data.username,
                email: this.sign_up_data.email,
                password: this.sign_up_data.password
            });
        result.subscribe(
            data => {
                if (data['result'] === 1) {
                    this.raiseSnackBar('Sign Up Successfully.', 'OK', () => {
                        console.log('The snack-bar action was triggered!');
                    });
                    this.tab_select = 0;
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
