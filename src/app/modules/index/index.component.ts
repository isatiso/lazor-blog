import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { CategoryDatabaseService, CategorySource } from 'service/category-database/category-database.service';
import { ArticleData, Category } from 'public/data-struct-definition';

import anime from 'animejs';

const cssSelector = anime({
    targets: '#anime-target',
    translateX: 250,
    rotate: 540,
    loop: true
});

console.log(cssSelector);

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
            transition('void <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('pageAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)')),
            transition('inactive <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('activeCate', [
            state('1', style({
                backgroundColor: '#ffffff',
                transform: 'rotate3d(-2, 3, 0, 20deg) skew(4deg)',
                boxShadow: '0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12)'
            })),
            state('0', style({
                backgroundColor: '#f6f6f6',
                transform: 'rotate3d(0, 0, 0, 0deg) skew(0deg)',
                boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)'
            })),
            transition('1 <=> 0', animate('300ms cubic-bezier(0.5, 2, 0.5, 0.5)')),
            transition('void => 1', animate('300ms cubic-bezier(0.5, 2, 0.5, 0.5)')),
            // transition('void <=> 0', animate('300ms cubic-bezier(0.5, 2, 0.5, 0.5)'))
        ])
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
        private _active_route: ActivatedRoute,
        private _category_db: CategoryDatabaseService
    ) { }

    get category_list(): Category[] {
        return this._category_db.index_category_list.value;
    }

    get current_category(): Category {
        return this._category_db.current_index_category;
    }

    get article_list(): ArticleData[] {
        return this._category_db.index_article_list.value;
    }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this.page_appear = 'active';
        if (this._active_route.firstChild) {
            this._category_db.get_index_category_list(this._active_route.firstChild.params['value']['category_id'] || null);
        } else {
            this._category_db.get_index_category_list(null);
        }
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
    }

    trig_article_list(category_id) {
        this._router.navigate([`/index/${category_id}`]);
        this._category_db.shuffle(category_id);
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

@Component({
    selector: 'la-index-article',
    templateUrl: './index-article.component.html',
    styleUrls: ['./index.component.scss'],
    animations: [
        trigger('loadArticle', [
            state('1', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition('void => 1', animate('200ms cubic-bezier(0, 1, 1, 1)')),
            transition('0 => 1', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
    ]
})
export class IndexArticleComponent {

    constructor(
        private _el: ElementRef,
        private _http: HttpClient,
        private _router: Router,
        private _active_route: ActivatedRoute,
        private _category_db: CategoryDatabaseService
    ) { }

    get category_list(): Category[] {
        return this._category_db.index_category_list.value;
    }

    get current_category(): Category {
        return this._category_db.current_index_category;
    }

    get article_list(): ArticleData[] {
        return this._category_db.index_article_list.value;
    }
}
