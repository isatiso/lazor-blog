import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AccountService } from 'service/account.service';
import { NoticeService } from 'service/notice.service';
import { LoggingService } from 'service/logging.service';
import { DocumentService } from 'service/document.service';
import { NavButtonService } from 'service/nav-button.service';

import { Account } from 'data-struct-definition';

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
            transition('* => *', animate('300ms ease-out'))
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
    public sign_in_data = {
        name: '',
        password: '',
    };

    public sign_up_data = {
        username: '',
        email: '',
        password: '',
    };

    public action = {
        self: this,
        select_change(event) {
            this.self._doc.title = event ? '注册' : '登录';
            this.self.tab_select = event;
        },
        go_sign_in(event?) {
            this.select_change(0);
        },
        go_sign_up(event?) {
            this.select_change(1);
        },
    };

    private _boss_key = Object.assign(Object.create(this.action), {
        ArrowLeft: this.action.go_sign_in,
        ArrowRight: this.action.go_sign_up,
    });

    constructor(
        private _active_route: ActivatedRoute,
        private _log: LoggingService,
        private _doc: DocumentService,
        private _notice: NoticeService,
        private _account: AccountService,
        private _nav_button: NavButtonService,
    ) { }

    ngOnInit() {
        this._active_route.queryParams.subscribe(
            params => {
                this._log.send('auth', {
                    des: '登录页',
                    from: (params['backurl'] || '/home')
                });
            });
        this._account.check_log();
        this._doc.title = this.tab_select ? '注册' : '登录';

        document.scrollingElement.scrollTop = 0;
        this.auth_exists = 'active';
        this._nav_button.button_list = [];
    }

    ngOnDestroy() {
        this.auth_exists = 'inactive';
    }

    sign_in(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }

        this._account.sign_in(this.sign_in_data);
    }

    sign_up(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
            return event;
        }
        this._account.sign_up(
            this.sign_up_data, res => {
                if (res) {
                    this.tab_select = 0;
                }
            });
    }

    boss_key_down(event) {
        if (event.ctrlKey && event.key in this._boss_key) {
            this._boss_key[event.key]();
            event.preventDefault();
        }

        return event;
    }
}
