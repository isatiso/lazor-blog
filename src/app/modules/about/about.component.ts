import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AboutContent } from './about.md';
import { NavButtonService } from 'service/nav-button.service';
import { LoggingService } from 'service/logging.service';
import { DocumentService } from 'service/document.service';
import { NoticeService } from 'service/notice.service';


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
        private _nav_button: NavButtonService,
        private _notice: NoticeService,
        private _log: LoggingService,
        private _doc: DocumentService,
    ) { }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this._nav_button.button_list = [];
        this._doc.title = '关于';
        this._log.send('about', { des: '关于 Lazor Blog 页面' });
    }

    preview_image(event) {
        if (window['current_image']) {
            this._notice.preview({
                name: '',
                src: window['current_image']
            }, () => { }).subscribe();
            window['current_image'] = null;
        }
    }
}
