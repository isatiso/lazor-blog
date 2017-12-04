import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatDialog } from '@angular/material';

import { AboutContent } from './about.md';
import { PreviewComponent } from 'public/preview/preview.component';

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
    about_content = new AboutContent();

    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
    }

    preview_image(event) {
        if (window['current_image']) {
            this.dialog.open(PreviewComponent, {
                data: {
                    name: '',
                    src: window['current_image']
                }
            }).afterClosed().subscribe(
                res => { });
            window['current_image'] = null;
        }
    }
}
