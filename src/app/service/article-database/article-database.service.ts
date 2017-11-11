import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { Article, ArticleData } from 'public/data-struct-definition';

@Injectable()
export class ArticleDatabaseService {
    current_article_data: BehaviorSubject<ArticleData> = new BehaviorSubject<ArticleData>(null);
    current_article_id = '';

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _category_db: CategoryDatabaseService
    ) { }

    get current_article(): ArticleData {
        return this.current_article_data.value;
    }

    set current_article(source: ArticleData) {
        this.current_article_data.next(source);
        this._category_db.find_last_and_next(this.current_article);
    }

    fetch(article_id: string) {
        const dataExchange: AsyncSubject<Article> = new AsyncSubject<Article>();
        const cache_info = window.sessionStorage.getItem('article-' + article_id);
        if (!cache_info) {
            this._http.get('/middle/article?article_id=' + article_id).subscribe(
                res => {
                    if (!res['result'] && res['status'] === 4004) {
                        const navigationExtras: NavigationExtras = {
                            queryParams: {
                                'message': 'Sorry, we can\'t find this article.',
                            }
                        };
                        this._router.navigate(['/error'], navigationExtras);
                        return;
                    } else {
                        window.sessionStorage.setItem('article-' + article_id, JSON.stringify(res['data']));
                        this._category_db.update(res['data']['category_id']);
                        dataExchange.next(res['data']);
                        dataExchange.complete();
                        this.current_article = res['data'];
                        this.current_article_id = this.current_article.article_id;
                    }
                },
                error => {
                }
            );
        } else {
            const data = JSON.parse(cache_info);
            this._category_db.update(data['category_id']);
            dataExchange.next(data);
            dataExchange.complete();
            this.current_article = data;
            this.current_article_id = this.current_article.article_id;
        }

        return dataExchange;
    }

    remove(article_id: string) {
        this._http.delete('/middle/article?article_id=' + article_id).subscribe(
            res => {
                if (res['result']) {
                    window.sessionStorage.removeItem('article-' + article_id);
                }
            },
            error => {
            }
        );
    }

}

