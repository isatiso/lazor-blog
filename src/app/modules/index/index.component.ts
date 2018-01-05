import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { CategoryDatabaseService } from 'service/category-database.service';
import { LoggingService } from 'service/logging.service';
import { ArticleData, Category } from 'public/data-struct-definition';
import { NavButtonService } from 'service/nav-button.service';

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
            transition('void => 1', animate('300ms cubic-bezier(0.5, 2, 0.5, 0.5)'))
        ])
    ]
})
export class IndexComponent implements OnInit, OnDestroy {
    public banner_move = 'active';
    public page_appear = 'active';

    constructor(
        private _log: LoggingService,
        private _router: Router,
        private _active_route: ActivatedRoute,
        private _category_db: CategoryDatabaseService,
        private _nav_button: NavButtonService,
    ) { }

    public source = {
        self: this,
        get category_list(): Category[] {
            return this.self._category_db.index_category_list.value;
        },
        get current_category(): Category {
            return this.self._category_db.current_index_category;
        },
    };

    public action = Object.assign(Object.create(this.source), {
        trig_article_list(category_id) {
            this.self._router.navigate([`/index/${category_id}`]);
            this.self._category_db.shuffle(category_id);
        }
    });

    ngOnInit() {

        this._log.send('index', { des: '索引页' });

        if (this._active_route.firstChild) {
            this._category_db.get_index_category_list(this._active_route.firstChild.params['value']['category_id'] || null);
        } else {
            this._category_db.get_index_category_list(null);
        }

        document.scrollingElement.scrollTop = 0;
        this.page_appear = 'active';
        this._nav_button.button_list = [];
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
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
        private _category_db: CategoryDatabaseService
    ) { }

    get article_list(): ArticleData[] {
        return this._category_db.index_article_list.value;
    }
}
