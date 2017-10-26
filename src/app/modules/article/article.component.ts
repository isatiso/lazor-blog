import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'la-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    animations: [
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
export class ArticleComponent implements OnInit, OnDestroy {

    article_exists = 'active';
    constructor() { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.article_exists = 'active';
    }

    ngOnDestroy() {
        this.article_exists = 'inactive';
    }

}
