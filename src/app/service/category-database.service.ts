import { Injectable, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AccountService } from 'service/account.service';
import { ArticleData, Category, Options } from 'public/data-struct-definition';


@Injectable()
export class CategoryDatabaseService {
    category_list_data: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>(null);
    home_list_data: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    view_list_data: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_article_list: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);
    index_category_list: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
    last_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    next_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    current_category_data: Category;
    current_index_category: Category;
    category_settimeout_handler: any;
    article_settimeout_handler: any;
    init_status = false;

    constructor(
        private _http: HttpClient,
        private _account: AccountService
    ) {
        const data = window.sessionStorage.getItem('current_category');

        if (data && data !== 'undefined') {
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
        this.home_list_data.next(source);
    }

    get view_list(): ArticleData[] {
        return this.view_list_data.value;
    }

    set view_list(source: ArticleData[]) {
        this.view_list_data.next(source);
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
            if (!this.current_category.category_id) {
                this.current_category = this.category_list[0];
            } else if (data.findIndex(el => el.category_id === this.current_category['category_id']) === -1) {
                this.current_category = this.category_list[0];
            }
            this.update_home(this.current_category.category_id, new Options({
                flush: true,
                article_id: options['article_id']
            }));
            this.init_status = true;
        };

        const assemble_data = (data) => {
            const order_list = data['order_list'];
            const category_list: Array<object> = data['category_list'];
            if (order_list && order_list.length) {
                category_list.sort((a, b) => {
                    const a_index = order_list.findIndex(el => el === a['category_id']);
                    const b_index = order_list.findIndex(el => el === b['category_id']);
                    return a_index - b_index;
                });
            }
            return category_list;
        };

        if (options.flush || !cache_info) {
            this._http.get('/middle/category').subscribe(
                res => {
                    if (res['data']) {
                        const data = assemble_data(res['data']);
                        window.sessionStorage.setItem('category_list', JSON.stringify(data));
                        update_data(data);
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

    update_home(category_id: string, options = new Options({})) {

        const update_data = (data) => {
            this.home_list = data.map(
                item => {
                    return new ArticleData(item);
                });
        };

        const assemble_data = (data) => {
            const order_list = data['order_list'];
            const article_list: Array<object> = data['article_list'];
            if (order_list && order_list.length) {
                article_list.sort((a, b) => {
                    const a_index = order_list.findIndex(el => el === a['article_id']);
                    const b_index = order_list.findIndex(el => el === b['article_id']);
                    return a_index - b_index;
                });
            }
            return article_list;
        };

        if (this.category_list === null) {
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
                        const data = assemble_data(res['data']);
                        window.sessionStorage.setItem('category-' + category_id, JSON.stringify(data));
                        update_data(data);
                    },
                    error => {
                    }
                );
            } else {
                update_data(JSON.parse(cache_info));
            }
        }
    }

    update_view(category_id: string, options = new Options({})) {

        const update_data = (data) => {
            this.view_list = data.map(
                item => {
                    return new ArticleData(item);
                });
            if (options.article_id) {
                this.find_last_and_next(options.article_id);
            }
        };

        const assemble_data = (data) => {
            const order_list = data['order_list'];
            const article_list: Array<object> = data['article_list'];
            if (order_list && order_list.length) {
                article_list.sort((a, b) => {
                    const a_index = order_list.findIndex(el => el === a['article_id']);
                    const b_index = order_list.findIndex(el => el === b['article_id']);
                    return a_index - b_index;
                });
            }
            return article_list;
        };

        const cache_info = window.sessionStorage.getItem('category-' + category_id);
        if (options.flush || !cache_info) {
            this._http.get('/middle/article/user-list?category_id=' + category_id).subscribe(
                res => {
                    const data = assemble_data(res['data']);
                    window.sessionStorage.setItem('category-' + category_id, JSON.stringify(data));
                    update_data(data);
                },
                error => {
                }
            );
        } else {
            update_data(JSON.parse(cache_info));
        }
    }

    push_article_order() {
        clearTimeout(this.article_settimeout_handler);
        this.article_settimeout_handler = setTimeout(() => {
            const order_list = this.home_list.map(item => item.article_id);
            this._http.post('/middle/article/order', {
                category_id: this.current_category.category_id,
                order_list: order_list
            }).subscribe(
                res => {
                    this.clear_category_cache(this.current_category.category_id);
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
                    this.clear_category_cache('list');
                },
                error => {
                });
        }, 800);
    }

    clear_category_cache(category_id) {
        window.sessionStorage.removeItem('category-' + category_id);
    }

    clear_push_article_order() {
        clearTimeout(this.article_settimeout_handler);
    }

    clear_push_category_order() {
        clearTimeout(this.category_settimeout_handler);
    }

    get_index_category_list(category_id?: string) {
        const cache_info = window.sessionStorage.getItem('category-index');
        if (!cache_info) {
            this._http.get('/middle/category/index').subscribe(res => {
                if (res) {
                    window.sessionStorage.setItem('category-index', JSON.stringify(res['data']['category_list']));
                    this.index_category_list.next(res['data']['category_list']);
                    if (category_id) {
                        this.shuffle(category_id);
                    } else {
                        if (res['data']['category_list'].length) {
                            this.shuffle(res['data']['category_list'][0]['category_id']);
                        }
                    }
                }
            });
        } else {
            this.index_category_list.next(JSON.parse(cache_info));
            if (JSON.parse(cache_info)) {
                if (category_id) {
                    this.shuffle(category_id);
                } else {
                    this.shuffle(JSON.parse(cache_info)[0]['category_id']);
                }
            }
        }
    }

    shuffle(category_id: string, options = new Options({})) {

        const update_data = (data) => {
            this.index_article_list.next(data.map(
                item => {
                    return new ArticleData(item);
                }));
        };

        const assemble_data = (data) => {
            const order_list = data['order_list'];
            const article_list: Array<object> = data['article_list'];
            if (order_list && order_list.length) {
                article_list.sort((a, b) => {
                    const a_index = order_list.findIndex(el => el === a['article_id']);
                    const b_index = order_list.findIndex(el => el === b['article_id']);
                    return a_index - b_index;
                });
            }
            return article_list;
        };

        this.current_index_category = this.index_category_list.value.find(item => item.category_id === category_id);

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
                    const data = assemble_data(res['data']);
                    window.sessionStorage.setItem('category-' + category_id, JSON.stringify(data));
                    update_data(data);
                },
                error => {
                }
            );
        } else {
            update_data(JSON.parse(cache_info));
        }
    }

    find_last_and_next(article_id: string) {
        const length = this.view_list.length;
        const current_index = this.view_list.findIndex(el => {
            return el.article_id === article_id;
        });

        if (current_index !== -1) {
            this.next = current_index === 0 ? null : this.view_list[current_index - 1];
            this.last = current_index === length - 1 ? null : this.view_list[current_index + 1];
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
                return this._db.index_article_list;
            default:
                return this._db.home_list_data;
        }
    }

    disconnect() { }
}
