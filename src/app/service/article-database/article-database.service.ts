import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { Article } from 'public/data-struct-definition';

@Injectable()
export class ArticleDatabaseService {

    constructor(
        private _http: HttpClient,
        private _router: Router,
    ) { }

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
                        dataExchange.next(res['data']);
                        dataExchange.complete();
                    }
                },
                error => {
                }
            );
        } else {
            dataExchange.next(JSON.parse(cache_info));
            dataExchange.complete();
        }

        return dataExchange;
    }

}

