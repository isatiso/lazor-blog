import { Injectable, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ArticleData, Category } from 'public/data-struct-definition';

@Injectable()
export class CategoryDatabaseService {
    category_list_data: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
    home_list_data: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    last_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    next_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    current_category: Category;
    current_category_id = '';

    constructor(
        private _http: HttpClient
    ) { }

    get category_list(): Category[] {
        return this.category_list_data.value;
    }

    set category_list(source: Category[]) {
        this.category_list_data.next(source);
    }

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

    pull(flush?: boolean) {
        const cache_info = window.sessionStorage.getItem('category_list');
        if (flush || !cache_info) {
            this._http.get('/middle/category').subscribe(
                res => {
                    if (res['data']) {
                        window.sessionStorage.setItem('category_list', JSON.stringify(res['data']));
                        this.category_list = res['data'];
                        const current_category_exists = this.category_list.findIndex(
                            ctg => {
                                return ctg['category_id'] === this.current_category_id;
                            });
                        if (current_category_exists === -1) {
                            this.current_category = this.category_list[0];
                            this.update(this.current_category['category_id'], true);
                        } else {
                            this.update(this.current_category_id, true);
                        }
                    }
                },
                error => {
                    console.log(error);
                }
            );
        } else {
            this.category_list = JSON.parse(cache_info);
            const current_category_exists = this.category_list.findIndex(
                ctg => {
                    return ctg['category_id'] === this.current_category_id;
                });
            if (current_category_exists === -1) {
                this.current_category = this.category_list[0];
                this.update(this.current_category['category_id'], true);
            } else {
                this.update(this.current_category_id, true);
            }
        }
    }

    update(category_id: string, flush?: boolean) {
        console.log('update', category_id, this.category_list);
        this.current_category_id = category_id;
        if (!this.category_list.length) {
            this.pull(true);
        } else {
            if (!category_id) {
                category_id = '';
            }
            const cache_info = window.sessionStorage.getItem('category-' + category_id);
            this.current_category = this.category_list.find(
                ctg => {
                    return ctg['category_id'] === category_id;
                });
            if (!this.current_category) {
                this.current_category = this.category_list[0];
            }
            this.current_category_id = this.current_category['category_id'];
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

    find_last_and_next(article: ArticleData) {
        const length = this.home_list.length;
        const current_index = this.home_list.findIndex(ele => {
            return ele.article_id === article.article_id;
        });

        console.log(length, current_index, this.home_list);

        if (current_index !== -1) {
            this.last = current_index === 0 ? null : this.home_list[current_index - 1];
            this.next = current_index === length - 1 ? null : this.home_list[current_index + 1];
        } else {
            this.last = null;
            this.next = null;
        }

        console.log(this.last, this.next);
    }

    is_current(category_id) {
        return this.current_category_id === category_id;
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
