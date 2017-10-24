import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { DataSource } from '@angular/cdk/table';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'la-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('banner', [
            state('0', style({
                color: '#000000',
                opacity: 1,
            })),
            transition('void => 0', animate('500ms ease-in'))
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
export class HomeComponent implements OnInit, OnDestroy {

    home_exists = 'active';
    displayedColumns = [
        'title',
        'author',
        'create_time'
    ];
    articleDatabase = new ArticleDatabase();
    dataSource: ArticleDataSource | null;
    constructor() { }

    ngOnInit() {
        this.home_exists = 'active';
        this.dataSource = new ArticleDataSource(this.articleDatabase);
        this.articleDatabase.dataChange.next(
            [{
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }, {
                article_id: '',
                title: 'asd',
                author_id: '',
                author: 'plank',
                create_time: 123123123123
            }]
        );
    }

    ngOnDestroy() {
        this.home_exists = 'inactive';
    }


}
export interface ArticleData {
    article_id: string;
    title: string;
    author_id: string;
    author: string;
    create_time: number;
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
