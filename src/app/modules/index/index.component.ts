import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { ArticleData } from 'public/data-struct-definition';

@Component({
    selector: 'la-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    animations: [
        trigger('bannerAnimation', [
            state('active', style({
                transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
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
export class IndexComponent implements OnInit, OnDestroy {
    banner_exists = 'active';
    index_exists = 'active';
    content_rows = 30;
    articleDatabase = new ArticleDatabase();
    dataSource: ArticleDataSource | null;
    displayedColumns = [
        'title',
        // 'author',
        // 'category',
        // 'create_time'
    ];
    @ViewChild('banner') banner;
    height = 100;
    constructor(
        private _http: HttpClient,
        private _router: Router,
        private el: ElementRef,
        private nav_profile: NavProfileService
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.index_exists = 'active';
        this.dataSource = new ArticleDataSource(this.articleDatabase);
        this.nav_profile.navbarWidth = this.el.nativeElement.firstChild.clientWidth;
        this.query_article_list();
    }

    ngOnDestroy() {
        this.index_exists = 'inactive';
    }

    onscroll(event) {
        const scrollTop = event.target.scrollingElement.scrollTop;
        if (scrollTop <= this.height) {
            this.banner.nativeElement.firstElementChild.style.opacity = 1 - (scrollTop / this.height);
        } else {
            this.banner.nativeElement.firstElementChild.style.opacity = 0;
        }
    }

    query_article_list() {
        this._http.get('/middle/article/index-list').subscribe(
            res => {
                this.articleDatabase.dataChange.next(res['data']);
            }
        );
    }
}

export class ArticleDatabase {
    dataChange: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);

    get data(): ArticleData[] { return this.dataChange.value; }

    constructor() {
    }
}

export class ArticleDataSource extends DataSource<any> {
    constructor(private _exampleDatabase: ArticleDatabase) {
        super();
    }

    connect(): Observable<ArticleData[]> {
        return this._exampleDatabase.dataChange;
    }

    disconnect() { }
}
