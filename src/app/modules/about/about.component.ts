import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'la-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void <=> active', animate('300ms ease-in')),
            transition('inactive <=> active', animate('300ms ease-in'))
        ]),
    ]
})
export class AboutComponent implements OnInit, OnDestroy {

    about_exists = 'active';
    constructor() { }

    ngOnInit() {
        this.about_exists = 'active';
    }

    ngOnDestroy() {
        this.about_exists = 'inactive';
    }

}
