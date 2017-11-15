import { Injectable, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ArticleData, Category, Options } from 'public/data-struct-definition';

@Injectable()
export class CategoryDatabaseService {
    category_list_data: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
    home_list_data: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    last_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    next_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    current_category_data: Category;
    category_settimeout_handler: any;
    article_settimeout_handler: any;

    constructor(
        private _http: HttpClient
    ) {
        const data = window.sessionStorage.getItem('current_category');
        if (data) {
            const data_object = JSON.parse(data);
            this.current_category_data = data_object;
        } else {
            this.current_category_data = new Category({});
        }

        const data_list = window.sessionStorage.getItem('category_list');
        if (data_list) {
            this.category_list_data.next(JSON.parse(data_list));
        } else {
            this.category_list_data.next([]);
        }
    }

    get category_list(): Category[] {
        return this.category_list_data.value;
    }

    set category_list(source: Category[]) {
        this.category_list_data.next(source);
        window.sessionStorage.setItem('category_list', JSON.stringify(source));
    }

    get home_list(): ArticleData[] {
        return this.home_list_data.value;
    }

    set home_list(source: ArticleData[]) {
        // console.log('set home_list', source);
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

    get current_category(): Category {
        if (!this.current_category_data) {
            return new Category({});
        } else {
            return this.current_category_data;
        }
    }

    set current_category(source: Category) {
        window.sessionStorage.setItem('current_category', JSON.stringify(source));
        this.current_category_data = source;
    }

    pull(options?: Options) {
        if (!options) {
            options = new Options({});
        }
        const cache_info = window.sessionStorage.getItem('category_list');
        const update_data = data => {
            this.category_list = data;
            console.log(data);
            if (!this.current_category.category_id) {
                this.current_category = this.category_list[0];
                this.update(this.current_category['category_id'], new Options({
                    flush: true,
                    article_id: options['article_id']
                }));
            } else {
                this.update(this.current_category.category_id, new Options({
                    flush: true,
                    article_id: options['article_id']
                }));
            }
        };

        if (options.flush || !cache_info) {
            this._http.get('/middle/category').subscribe(
                res => {
                    if (res['data']) {
                        window.sessionStorage.setItem('category_list', JSON.stringify(res['data']));
                        update_data(res['data']);
                    }
                },
                error => {
                    console.log(error);
                }
            );
        } else {
            update_data(JSON.parse(cache_info));
        }
    }

    update(category_id: string, options = new Options({})) {

        const update_data = (data) => {
            this.home_list = data.map(
                item => {
                    return new ArticleData(item);
                });
            if (options.article_id) {
                this.find_last_and_next(options.article_id);
            }
        };

        if (!this.category_list.length) {
            this.pull(new Options({ flush: true, article_id: options.article_id }));
        } else {
            if (!category_id) {
                category_id = '';
            }
            const cache_info = window.sessionStorage.getItem('category-' + category_id);
            const current_category = this.category_list.find(
                ctg => {
                    return ctg['category_id'] === category_id;
                });
            if (!current_category) {
                this.current_category = this.category_list[0];
            } else {
                this.current_category = current_category;
            }
            if (options.flush || !cache_info) {
                this._http.get('/middle/article/user-list?category_id=' + category_id).subscribe(
                    res => {
                        window.sessionStorage.setItem('category-' + category_id, JSON.stringify(res['data']));
                        update_data(res['data']);
                    },
                    error => {
                    }
                );
            } else {
                update_data(JSON.parse(cache_info));
            }
        }
    }

    push_article_order() {
        clearTimeout(this.article_settimeout_handler);
        this.article_settimeout_handler = setTimeout(() => {
            const order_list = this.home_list.map(
                item => {
                    return item.article_id;
                });
            this._http.post('/middle/article/order', {
                category_id: this.current_category.category_id,
                order_list: order_list
            }).subscribe(
                res => {
                    console.log(this.home_list);
                    this.home_list = order_list.map(item => {
                        return this.home_list.find(article => {
                            return article.article_id === item;
                        });
                    });
                    window.sessionStorage.setItem('category-' + this.current_category.category_id, JSON.stringify(this.home_list));
                    console.log(this.home_list);
                },
                error => {
                });
        }, 800);
    }

    push_category_order() {
        clearTimeout(this.article_settimeout_handler);
        this.article_settimeout_handler = setTimeout(() => {
            const order_list = this.category_list.map(
                item => {
                    return item.category_id;
                });
            this._http.post('/middle/category/order', {
                order_list: order_list
            }).subscribe(
                res => {
                    console.log(this.category_list);
                    this.category_list = order_list.map(item => {
                        return this.category_list.find(category => {
                            return category.category_id === item;
                        });
                    });
                    window.sessionStorage.setItem('category-list', JSON.stringify(this.category_list));
                    console.log(this.category_list);
                },
                error => {
                });
        }, 800);
    }

    clear_push_article_order() {
        clearTimeout(this.article_settimeout_handler);
    }

    clear_push_category_order() {
        clearTimeout(this.category_settimeout_handler);
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

    find_last_and_next(article_id: string) {
        const length = this.home_list.length;
        const current_index = this.home_list.findIndex(ele => {
            return ele.article_id === article_id;
        });

        if (current_index !== -1) {
            this.next = current_index === 0 ? null : this.home_list[current_index - 1];
            this.last = current_index === length - 1 ? null : this.home_list[current_index + 1];
        } else {
            this.next = null;
            this.last = null;
        }
    }

    change_order(order_list: number[]) {

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
