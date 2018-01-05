import { Component, Inject, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';

import { MarkdownDirective } from 'directive/markdown.directive';

import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { ScrollorService } from 'service/scrollor.service';
import { LoggingService } from 'service/logging.service';
import { NoticeService } from 'service/notice.service';
import { NavButtonService } from 'service/nav-button.service';

import { Options, NavButton } from 'data-struct-definition';

@Component({
    selector: 'la-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('1', style({
                opacity: 1,
            })),
            state('0', style({
                opacity: 0,
            })),
            transition('void => 1', animate('300ms cubic-bezier(0, 1, 1, 1)')),
            transition('1 => 0', animate('200ms ease-in')),
            transition('0 => 1', animate('200ms ease-out'))
        ])
    ]
})
export class ArticleComponent implements OnInit, AfterViewInit {

    public render_latex: any;
    public page_appear: number;

    public source = {
        self: this,
        get last_article() {
            return this.self._category_db.last;
        },
        get next_article() {
            return this.self._category_db.next;
        },
        get current_article() {
            return this.self._article_db.current_article;
        },
    };

    public action = Object.assign(Object.create(this.source), {
        go_editor: (event?) => {
            this._router.navigate(['/editor/' + this.source.current_article.article_id]);
        },
        go_top: (event?) => {
            this._scrollor.goto_top();
        },
        go_bottom: (event?) => {
            this._scrollor.goto_bottom();
        },
        go_last: (event?) => {
            if (this.source.last_article) {
                this.flip(this.source.last_article.article_id);
            }
        },
        go_next: (event?) => {
            if (this.source.next_article) {
                this.flip(this.source.next_article.article_id);
            }
        },
        go_home: (event?) => {
            this._router.navigate(['/home']);
        },
    });

    private _boss_key = Object.assign(Object.create(this.action), {
        ArrowLeft: this.action.go_last,
        ArrowRight: this.action.go_next,
        ArrowUp: this.action.go_top,
        ArrowDown: this.action.go_bottom,
        e: this.action.go_editor,
        0: this.action.go_home,
    });

    constructor(
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _log: LoggingService,
        private _notice: NoticeService,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _scrollor: ScrollorService,
        private _nav_button: NavButtonService,
    ) { }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this.page_appear = 1;
        this._nav_button.button_list = [{
            name: 'navEditor',
            icon: () => 'mode_edit',
            callback: event => this.action.go_editor(event),
            tool_tip: () => '编辑文章 (ctrl + E)',
        }, {
            name: 'navTop',
            icon: () => 'arrow_upward',
            callback: event => this._scrollor.goto_top(event),
            tool_tip: () => '回到顶部 (ctrl + ↑)',
        }];
    }

    ngAfterViewInit() {
        const article_id = this._activate_route.params['value']['id'];
        const flush = Boolean(this._activate_route.queryParams['value']['from'] === 'editor');
        this._article_db.fetch(article_id, new Options({ flush: flush })).subscribe(
            res => {
                setTimeout(() => {
                    this._log.send(
                        'article/' + this.source.current_article.article_id,
                        {
                            des: '文章查看页面',
                            title: this.source.current_article.title,
                            author: this.source.current_article.author
                        }
                    );
                    this.render_latex = article_id;
                }, 0);
            }
        );
    }

    preview_image(event) {
        if (window['current_image']) {
            this._notice.preview({
                name: '',
                src: window['current_image']
            }, () => { }).subscribe();
            window['current_image'] = null;
        }
    }

    flip(article_id) {
        this.page_appear = 0;
        setTimeout(() => {
            this._router.navigate(
                ['/article/' + article_id]
            ).then(
                () => {
                    this.ngOnInit();
                    this.ngAfterViewInit();
                });
            document.scrollingElement.scrollTop = 0;
        }, 300);
    }

    boss_key_down(event) {
        if (event.ctrlKey && event.key in this._boss_key) {
            this._boss_key[event.key]();
            event.preventDefault();
        }

        return event;
    }
}
