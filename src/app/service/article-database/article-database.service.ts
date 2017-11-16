import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { Article, ArticleData, Options } from 'public/data-struct-definition';

@Injectable()
export class ArticleDatabaseService {
    current_article_data: BehaviorSubject<ArticleData>;
    on_edit_data: BehaviorSubject<ArticleData>;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _category_db: CategoryDatabaseService
    ) {
        this.current_article_data = new BehaviorSubject<ArticleData>(new ArticleData({}));
        this.on_edit_data = new BehaviorSubject<ArticleData>(new ArticleData({}));
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

    fetch(article_id: string) {

        const dataExchange: AsyncSubject<Article> = new AsyncSubject<Article>();
        const cache_info = window.sessionStorage.getItem('article-' + article_id);

        const update_data = data => {
            const options = new Options({ article_id: article_id });
            this._category_db.update(data['category_id'], options);
            dataExchange.next(data);
            dataExchange.complete();
            this.current_article = new ArticleData(data);
        };

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
                    } else {
                        window.sessionStorage.setItem('article-' + article_id, JSON.stringify(res['data']));
                        update_data(res['data']);
                    }
                },
                error => {
                }
            );
        } else {
            const data = JSON.parse(cache_info);
            update_data(data);
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

