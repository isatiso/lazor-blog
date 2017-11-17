import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'la-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('1', style({
                opacity: 1,
            })),
            transition('* <=> 1', animate('300ms cubic-bezier(0, 1, 1, 1)')),
        ]),
    ]
})
export class AboutComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
    }
}
