import { Component, ElementRef, OnInit, OnChanges, AfterViewInit, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { NavBgDirective } from 'directive/nav-bg.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
@Component({
    selector: 'la-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
    title = 'Lazor Blog';
    scroll_top = 0;
    height_limit = 0;
    client_width = 0;
    navbarWidth = 0;
    constructor(
        private el: ElementRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public nav_profile: NavProfileService,
    ) { }

    ngOnInit() {

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

    ngAfterViewInit() {
        // console.log(this.el.nativeElement.lastElementChild.style.backgroundColor);
    }

    ngAfterViewChecked() {
        // console.log(this.el.nativeElement.lastElementChild.style.backgroundColor);
    }

    ngOnChanges() {
    }

    onscroll(event) {
        this.scroll_top = document.body.scrollTop;
        return event;
    }
}
