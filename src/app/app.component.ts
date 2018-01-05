import { Component, ElementRef, Inject, OnInit, OnChanges, AfterViewInit, AfterViewChecked, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { NavBgDirective } from 'directive/nav-bg.directive';
import { NavProfileService } from 'service/nav-profile.service';
import { NoticeService } from 'service/notice.service';
import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { AccountService } from 'service/account.service';
import { LoggingService } from 'service/logging.service';
import { NavButtonService } from 'service/nav-button.service';

import { NavButton } from 'public/data-struct-definition';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';

import * as platform from 'platform';

import anime from 'animejs';

@Component({
    selector: 'la-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('navBarAnimation', [
            state('active', style({
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
    ]
})
export class AppComponent implements OnInit, AfterViewInit {
    navbar_exists = 'active';
    children_appear = 'active';
    title = 'Lazor Blog';
    scroll_top = 0;
    height_limit = 0;
    client_width = 0;
    navbarWidth = 0;
    footer_type = 'normal';

    constructor(
        private el: ElementRef,
        private router: Router,
        private _http: HttpClient,
        private activatedRoute: ActivatedRoute,
        private _account: AccountService,
        private _log: LoggingService,
        private _notice: NoticeService,
        public dialog: MatDialog,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _nav_button: NavButtonService,
        public nav_profile: NavProfileService,
    ) { }

    @ViewChild('siteLogo') site_logo;
    @ViewChild('appContainer') app_container;
    @ViewChild('footer') footer;

    get current_user(): string {
        if (this._account.data) {
            return this._account.data.user_name;
        } else {
            return '';
        }
    }

    get outer_width(): number {
        return window.outerWidth;
    }

    get nav_button_list(): any {
        return this._nav_button.button_list_subject;
    }

    ngOnInit() {
        window.sessionStorage.clear();
        clearInterval(window['loading_holder']);
        this._account.update_user_info();
        console.log('platform:', platform.name);
        if (this.router.url === '/home' || this.router.url === '/') {
            this.height_limit = 276;
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register(
                'lazor-server.js', {
                    scope: '/'
                }).then(
                registration => {
                    return true;
                }).catch(
                error => { }
                );
        }

        this.router.events.filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            })
            .mergeMap(route => route.data)
            .subscribe((data) => {
                if (data['scrollLimit']) {
                    if (window.outerWidth > 769) {
                        this.height_limit = 276;
                    } else {
                        this.height_limit = 152;
                    }

                } else {
                    this.height_limit = 0;
                }
                this.footer_type = data['footerType'];
            });

        const wrapperEl = document.querySelector('#loading-wrapper');
        const wrapperBg = document.querySelector('#cover-background');

        anime.timeline({
            targets: [wrapperEl, wrapperBg],
            opacity: 0,
            duration: 1000,
            easing: 'linear'
        }).add({
            opacity: 0,
        }).add({
            zIndex: -1,
        });

        setTimeout(() => {
            wrapperEl.innerHTML = '';
        }, 1000);
        setTimeout(() => {
            this.app_container.nativeElement.style.minHeight = window.innerHeight - this.footer.nativeElement.clientHeight + 'px';
        }, 0);
    }

    ngAfterViewInit() {
        const logo_anime_handler = anime({
            targets: this.site_logo.nativeElement,
            rotate: [
                { value: ['0turn', '7turn'], duration: 3000, easing: [0, 0.6, 1, 0.4] },
                { value: ['7turn', '0turn'], duration: 3000, easing: [0, 0.6, 1, 0.4] },
                { value: ['0turn', '-7turn'], duration: 3000, easing: [0, 0.6, 1, 0.4] },
                { value: ['-7turn', '7turn'], duration: 3000, easing: [0, 0.6, 1, 0.4] },
                { value: ['7turn', '0turn'], duration: 3000, easing: [0, 0.6, 1, 0.4] },
            ],
            loop: true
        });

    }

    is_logged() {
        return this._account.data !== null;
    }

    onscroll(event) {
        this.scroll_top = event.target.scrollingElement.scrollTop;
        return event;
    }

    edit_profile() {
        const rate = window.outerWidth > 1024 ? .5 : .9;
        const editor_width = (window.outerWidth * rate) + 'px';

        this._notice.input({
            input_list: [{
                name: 'user_name',
                value: this._account.data.user_name,
                placeholder: 'Enter a New Name'
            }]
        }, res => {
            if (res) {
                this._account.update_username(res.user_name.value);
            }
        }).subscribe();
    }

    log_out() {
        this._http.delete('/middle/user').subscribe(
            res => {
                this._account.data = null;
            }
        );
        this.router.navigate(['/auth']);
    }
}
