import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { DocumentService } from 'service/document.service';
import { LoggingService } from 'service/logging.service';

@Component({
    selector: 'la-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
    animations: [
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
export class ErrorComponent implements OnInit {
    public error_exists = 'active';
    public message: string;
    public sub_message: string;

    constructor(
        private _router: Router,
        private _log: LoggingService,
        private _doc: DocumentService,
    ) { }

    ngOnInit() {
        this._doc.title = '啊哦, 出问题了';
        this._router.routerState.root.queryParams.subscribe(
            value => {
                if (value.message) {
                    this.message = value.message;
                    this.sub_message = value.sub_message;
                } else {
                    this.message = 'Page Not Found';
                    this.sub_message = 'Sorry for that.';
                }
                this._log.send('error', { message: this.message, sub_message: this.sub_message });
            }
        );
    }

    figure_left_width() {
        return window.innerWidth > 1024 ? 3 : 0;
    }

    figure_right_width() {
        return window.innerWidth > 1024 ? 7 : 10;
    }
}
