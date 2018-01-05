import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { NoticeService } from 'service/notice.service';
import { AccountService } from 'service/account.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { Article, ArticleData, Options } from 'public/data-struct-definition';

@Injectable()
export class ArticleDatabaseService {
    current_article_data: BehaviorSubject<ArticleData>;
    on_edit_data: BehaviorSubject<ArticleData>;
    article_status = 'published';
    current_img_list: BehaviorSubject<string[]>;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _notice: NoticeService,
        private _account: AccountService,
        private _category_db: CategoryDatabaseService
    ) {
        this.current_article_data = new BehaviorSubject<ArticleData>(new ArticleData({}));
        this.on_edit_data = new BehaviorSubject<ArticleData>(new ArticleData({}));
        this.current_img_list = new BehaviorSubject<string[]>([]);
    }

    get img_list(): string[] {
        return this.current_img_list.value;
    }

    set img_list(source: string[]) {
        this.current_img_list.next(source);
    }

    get current_article(): ArticleData {
        return this.current_article_data.value;
    }

    set current_article(source: ArticleData) {
        this.current_article_data.next(source);
        window.sessionStorage.setItem(
            'article-' + this.current_article.article_id,
            JSON.stringify(source));
        this._category_db.find_last_and_next(this.current_article.article_id);
    }

    get on_edit(): ArticleData {
        return this.on_edit_data.value;
    }

    set on_edit(source: ArticleData) {
        this.on_edit_data.next(source);
    }

    fetch(article_id: string, options?: Options) {

        if (!options) {
            options = new Options({});
        }

        const dataExchange: AsyncSubject<ArticleData> = new AsyncSubject<ArticleData>();
        const cache_info = window.sessionStorage.getItem('article-' + article_id);

        const update_data = data => {
            const update_options = new Options({ flush: options.flush, article_id: article_id });
            this._category_db.update_view(data['category_id'], update_options);
            dataExchange.next(data);
            dataExchange.complete();
            this.current_article = new ArticleData(data);
        };

        if (options.flush || !cache_info) {
            this._http.get('/middle/article?article_id=' + article_id).subscribe(
                res => {
                    if (!res['result'] && res['status'] === 4004) {
                        const navigationExtras: NavigationExtras = {
                            queryParams: {
                                'message': 'Sorry, we can\'t find this article.',
                            }
                        };
                        this._router.navigate(['/error'], navigationExtras);
                    } else {
                        window.sessionStorage.setItem('article-' + article_id, JSON.stringify(res['data']));
                        update_data(res['data']);
                    }
                },
                error => {
                }
            );
        } else {
            setTimeout(() => {
                const data = JSON.parse(cache_info);
                update_data(data);
            }, 0);
        }

        return dataExchange;
    }

    update_on_edit(article_id: string, options?: Options) {
        if (!options) {
            options = new Options({});
        }
        const dataExchange: AsyncSubject<ArticleData> = new AsyncSubject<ArticleData>();

        this._http.get('/middle/article?article_id=' + article_id).subscribe(
            res => {
                if (!res['result'] && res['status'] === 4004) {
                    const navigationExtras: NavigationExtras = {
                        queryParams: {
                            'message': 'Sorry, we can\'t find this article.',
                        }
                    };
                    this._router.navigate(['/error'], navigationExtras);
                } else {
                    window.sessionStorage.setItem('article-' + article_id, JSON.stringify(res['data']));
                    dataExchange.next(res['data']);
                    dataExchange.complete();
                    this.on_edit = new ArticleData(res['data']);
                }
            },
            error => {
            }
        );
        return dataExchange;
    }

    remove(article_id: string) {
        this._http.delete('/middle/article?article_id=' + article_id).subscribe(
            res => {
                if (res['result']) {
                    window.sessionStorage.removeItem('article-' + article_id);
                    this._category_db.update_home(
                        this._category_db.current_category.category_id, new Options({ flush: true }));
                }
            },
            error => {
            }
        );
    }


    create(category_id) {
        this._http.put('/middle/article', {
            category_id: category_id,
        }).subscribe(
            res => {
                if (res['result']) {
                    this.on_edit_data.next(new ArticleData({ title: 'Untitl' }));
                    this._router.navigate(['/editor/' + res['data']['article_id']]);
                } else {
                    this._notice.bar(res['msg'], res['status'], null);
                }
            });
    }

    save(source) {
        this._http.post('/middle/article', {
            article_id: source.article_id,
            title: source.title,
            content: source.content,
            category_id: source.category_id,
        }).subscribe(
            res => {
                if (res['result']) {
                    this.current_article = new ArticleData(res['data']);
                    this._notice.bar('Save Article Successfully.', 'OK', null);
                    if (source.last_category_id !== this._category_db.current_category.category_id) {
                        this._category_db.clear_category_cache(source.last_category_id);
                        source.last_category_id = this._category_db.current_category.category_id;
                        this._category_db.update_home(this._category_db.current_category.category_id, new Options({ flush: true }));
                    }
                    this.article_status = 'saved';
                } else if (res['status'] === 3005) {
                    this._account.relogin();
                }
            });
    }

    publish_current_article() {
        this._http.post('/middle/article/publish-state', {
            article_id: this.current_article.article_id,
            publish_status: 1
        }).subscribe(
            res => {
                this._notice.bar('Publish Article Successfully.', 'OK', null);
            });
    }

}

