import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { CategoryDatabaseService, CategorySource } from 'service/category-database/category-database.service';
import { ArticleData } from 'public/data-struct-definition';

@Component({
    selector: 'la-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    animations: [
        trigger('bannerMove', [
            state('active', style({
                transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
        trigger('pageAppear', [
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
export class IndexComponent implements OnInit, OnDestroy {
    public banner_move = 'active';
    public page_appear = 'active';
    public display_columns = ['title'];
    public category_source: CategorySource | null;
    private _scroll_height_limit = 100;

    @ViewChild('banner') private banner;

    constructor(
        private _el: ElementRef,
        private _http: HttpClient,
        private _router: Router,
        private _category_db: CategoryDatabaseService
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.page_appear = 'active';
        this.category_source = new CategorySource(this._category_db, 'index');
        this._category_db.shuffle(20);
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
    }

    onscroll(event) {
        const scroll_top = event.target.scrollingElement.scrollTop;
        if (scroll_top <= this._scroll_height_limit) {
            this.banner.nativeElement.firstElementChild.style.opacity = 1 - (scroll_top / this._scroll_height_limit);
        } else {
            this.banner.nativeElement.firstElementChild.style.opacity = 0;
        }
    }
}
