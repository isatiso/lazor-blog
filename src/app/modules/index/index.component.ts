import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';

@Component({
    selector: 'la-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    animations: [
        trigger('bannerAnimation', [
            state('active', style({
                transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void => active', animate('300ms ease-in')),
            transition('inactive => active', animate('300ms ease-in'))
        ]),
    ]
})
export class IndexComponent implements OnInit, OnDestroy {
    banner_exists = 'active';
    index_exists = 'active';

    @ViewChild('banner') banner;
    height = 100;
    constructor(
        private el: ElementRef,
        private nav_profile: NavProfileService
    ) { }

    ngOnInit() {
        this.index_exists = 'active';
        this.nav_profile.navbarWidth = this.el.nativeElement.firstChild.clientWidth;
    }

    ngOnDestroy() {
        this.index_exists = 'inactive';
    }

    onscroll(event) {
        const scrollTop = event.target.scrollingElement.scrollTop;
        if (scrollTop <= this.height) {
            this.banner.nativeElement.firstElementChild.style.opacity = 1 - (scrollTop / this.height);
        } else {
            this.banner.nativeElement.firstElementChild.style.opacity = 0;
        }
    }
}
