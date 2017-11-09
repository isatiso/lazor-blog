import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

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
            transition('* => active', animate('300ms ease-in'))
        ]),
    ]
})
export class ErrorComponent implements OnInit {
    public error_exists = 'active';
    public message: string;
    public sub_message: string;

    constructor(private _router: Router) { }

    ngOnInit() {
        this._router.routerState.root.queryParams.subscribe(
            value => {
                if (value.message) {
                    this.message = value.message;
                    this.sub_message = value.sub_message;
                } else {
                    this.message = 'Page Not Found';
                    this.sub_message = 'Sorry for that.';
                }
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
