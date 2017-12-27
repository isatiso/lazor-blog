import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ArticleDatabaseService } from 'service/article-database.service';
import { Marked } from './marked';

// A javascript lib has import, so here is just a delaration
declare var MathJax: any;

@Injectable()
export class MarkdownService {

    // private _renderer: any = new marked.Renderer();
    private _marked: any = new Marked();
    public img_list: string[] = [];

    constructor(
        private _article_db: ArticleDatabaseService,
    ) {
        // this.extendRenderer();
        this.setMarkedOptions({});
        this.setMathJaxOptions({});
    }

    // public get renderer() {
    // return this._renderer;
    // }

    // handle data
    public setMarkedOptions(options: any) {
        options = Object.assign({
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        }, options);
        // options.renderer = this._renderer;
        this._marked.setOptions(options);
    }

    public setMathJaxOptions(options: any) {
        MathJax.Hub.Config({
            showProcessingMessages: false,
            tex2jax: {
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
            },
            jax: [
                'input/TeX',
                'output/HTML-CSS'
            ],
            TeX: {
                equationNumbers: {
                    autoNumber: 'AMS'
                }
            },
            'HTML-CSS': {
                preferredFont: null,
                webFont: 'Gyre-Pagella',
                availableFonts: []
            }
        });
    }

    public render(el: any, data: string) {
        if (data) {
            el.nativeElement.innerHTML = this.compile(data);
            this._article_db.img_list = this._marked.img_list.slice();
        } else {
            el.nativeElement.innerHTML = '';
        }
    }

    // comple markdown to html
    public compile(data: string) {
        return this._marked.render(data);
    }

    public latexRender(env: any) {
        MathJax.Hub.Queue(
            ['Typeset', MathJax.Hub, env]
        );
    }
}
