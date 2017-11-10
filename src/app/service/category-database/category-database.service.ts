import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ArticleData } from 'public/data-struct-definition';

@Injectable()
export class CategoryDatabaseService {
    home_list_data: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    last_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    next_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    current_category: string;

    constructor(
        private _http: HttpClient,
    ) { }

    get home_list(): ArticleData[] {
        return this.home_list_data.value;
    }

    set home_list(source: ArticleData[]) {
        this.home_list_data.next(source);
    }

    get last(): ArticleData {
        return this.last_data.value;
    }

    set last(source: ArticleData) {
        this.last_data.next(source);
    }

    get next(): ArticleData {
        return this.next_data.value;
    }

    set next(source: ArticleData) {
        this.next_data.next(source);
    }

    update(category_id: string, flush?: boolean) {
        const cache_info = window.sessionStorage.getItem('category-' + category_id);
        this.current_category = category_id;
        if (flush || !cache_info) {
            this._http.get('/middle/article/user-list?category_id=' + category_id).subscribe(
                res => {
                    window.sessionStorage.setItem('category-' + category_id, JSON.stringify(res['data']));
                    this.home_list = res['data'];
                },
                error => {
                }
            );
        } else {
            this.home_list = JSON.parse(cache_info);
        }
    }

    shuffle(limit: number) {
        this._http.get('/middle/article/index-list?limit=' + limit).subscribe(
            res => {
                this.index_list.next(res['data']);
            },
            error => {
            }
        );
    }

    find_last_and_next(article_id: string, category_id: string) {
        const length = this.home_list_data.value.length;
        const current_index = this.home_list_data.value.findIndex(ele => {
            return ele.article_id === article_id;
        });

        if (current_index !== -1) {
            const last = current_index === 0 ? null : this.home_list_data.value[current_index - 1];
            const next = current_index === length - 1 ? null : this.home_list_data.value[current_index + 1];
        } else {

        }
    }
}

export class CategorySource extends DataSource<any> {
    constructor(private _db: CategoryDatabaseService, private _select?: string) {
        super();
    }

    connect(): Observable<ArticleData[]> {
        switch (this._select) {
            case 'home':
                return this._db.home_list_data;
            case 'index':
                return this._db.index_list;
            default:
                return this._db.home_list_data;
        }
    }

    disconnect() { }
}
