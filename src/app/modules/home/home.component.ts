import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'la-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    displayedColumns = [
        'title',
        'author',
        'create_time'
    ];
    articleDatabase = new ArticleDatabase();
    dataSource: ArticleDataSource | null;
    constructor() { }

    ngOnInit() {
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
