import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { ScrollorService } from 'service/scrollor//scrollor.service';
import { PreviewComponent } from 'component/preview/preview.component';
import { Article, ArticleData, Options } from 'public/data-struct-definition';


declare var Prism: any;

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
export class ArticleComponent implements OnInit {

    public render_latex: any;
    public page_appear: number;
    private nav_zone_width = 125;
    private right_nav_show = false;

    @ViewChild('navEditor') nav_editor;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _scrollor: ScrollorService,
        public dialog: MatDialog,
    ) { }

    get last_article() {
        return this._category_db.last;
    }

    get next_article() {
        return this._category_db.next;
    }

    get current_article() {
        return this._article_db.current_article;
    }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this.page_appear = 1;
        const article_id = this._activate_route.params['value']['id'];
        const flush = Boolean(this._activate_route.queryParams['value']['from'] === 'editor');
        this._article_db.fetch(article_id, new Options({ flush: flush })).subscribe(
            res => {
                this.render_latex = article_id;
            }
        );
    }

    show_nav_button(event) {
        if (event.type !== 'mousemove' || event.x >= event.view.innerWidth || event.x < 0) {
            return event;
        }

        if (event.x >= event.view.innerWidth - this.nav_zone_width * 0.33) {
            if (!this.right_nav_show) {
                this.right_nav_show = true;
                this.nav_editor._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-60px)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(60px)';
            }
        } else if (event.x < event.view.innerWidth - this.nav_zone_width * 1.5) {
            if (this.right_nav_show) {
                this.right_nav_show = false;
                this.nav_editor._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(80%)';
            }
        }
    }

    go_editor(event?) {
        this._router.navigate(['/editor/' + this.current_article.article_id]);
    }

    go_top(event?) {
        this._scrollor.goto_top();
    }

    go_bottom(event?) {
        this._scrollor.goto_bottom();
    }

    go_last(event?) {
        if (this.last_article) {
            this.change(this.last_article.article_id);
        }
    }

    go_next(event?) {
        if (this.next_article) {
            this.change(this.next_article.article_id);
        }
    }

    go_home(event?) {
        this._router.navigate(['/home']);
    }

    preview_image(event) {
        if (window['current_image']) {
            this.dialog.open(PreviewComponent, {
                data: {
                    name: '',
                    src: window['current_image']
                }
            }).afterClosed().subscribe(
                res => { });
            window['current_image'] = null;
        }

    }

    change(article_id) {
        this.page_appear = 0;
        setTimeout(() => {
            this._router.navigate(['/article/' + article_id]).then(() => { this.ngOnInit(); });
            document.scrollingElement.scrollTop = 0;
        }, 300);
    }

    boss_key(event) {
        const access_key = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'e',
            '0'
        ];

        if (!event.ctrlKey || access_key.indexOf(event.key) === -1) {
            return event;
        }
        if (event.key === 'ArrowLeft') {
            this.go_last();
        } else if (event.key === 'ArrowRight') {
            this.go_next();
        } else if (event.key === 'ArrowUp') {
            this.go_top(null);
        } else if (event.key === 'ArrowDown') {
            this.go_bottom(null);
        } else if (event.key === 'e') {
            this.go_editor();
        } else if (event.key === '0') {
            this.go_home();
        }
        event.preventDefault();
    }
}

