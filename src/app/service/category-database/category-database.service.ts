import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ArticleData } from 'public/data-struct-definition';

@Injectable()
export class CategoryDatabaseService {
    home_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);

    constructor(
        private _http: HttpClient,
    ) { }

    get data(): ArticleData[] {
        return this.home_list.value;
    }

    set data(source: ArticleData[]) {
        this.home_list.next(source);
    }

    update(category_id: string) {
        const cache_info = window.sessionStorage.getItem('category-' + category_id);

        if (!cache_info) {
            this._http.get('/middle/article/user-list?category_id=' + category_id).subscribe(
                res => {
                    window.sessionStorage.setItem('category-' + category_id, JSON.stringify(res['data']));
                    this.data = res['data'];
                },
                error => {
                    console.log(error);
                }
            );
        } else {
            this.data = JSON.parse(cache_info);
        }
    }

    shuffle(limit: number) {
        this._http.get('/middle/article/index-list?limit=' + limit).subscribe(
            res => {
                this.index_list.next(res['data']);
            },
            error => {
                console.log(error);
            }
        );
    }
}

