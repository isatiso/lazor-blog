import { Component, ElementRef, OnInit, OnChanges, AfterViewInit, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';

import { NavBgDirective } from 'directive/nav-bg.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { AccountService } from 'service/account/account.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
@Component({
    selector: 'la-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('navBarAnimation', [
            state('active', style({
                // color: '#000000',
                // transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                // color: '#000000',
                // transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
    ]
})
export class AppComponent implements OnInit {
    navbar_exists = 'active';
    children_appear = 'active';
    title = 'Lazor Blog';
    scroll_top = 0;
    height_limit = 0;
    client_width = 0;
    navbarWidth = 0;
    constructor(
        private el: ElementRef,
        private router: Router,
        private _http: HttpClient,
        private activatedRoute: ActivatedRoute,
        public account: AccountService,
        public nav_profile: NavProfileService,
    ) { }

    ngOnInit() {
        window.sessionStorage.clear();
        if (this.router.url === '/home' || this.router.url === '/') {
            this.height_limit = 276;
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
                    this.height_limit = data['scrollLimit'];
                } else {
                    this.height_limit = 0;
                }
            });
    }

    onscroll(event) {
        this.scroll_top = event.target.scrollingElement.scrollTop;
        return event;
    }

    log_out(event) {
        this._http.delete('/middle/user').subscribe(
            res => {
                this.account.data = null;
            }
        );
        this.router.navigate(['/auth']);
    }
}
