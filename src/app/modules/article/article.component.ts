import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { ScrollorService } from 'service/scrollor.service';
import { NavButtonService } from 'service/nav-button.service';
import { PreviewComponent } from 'preview/preview.component';
import { Article, ArticleData, Options, NavButton } from 'data-struct-definition';

import anime from 'animejs';

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
    public menu_anime_handler: any;
    public menu_anime_state = 'hidden';

    @ViewChild('navEditor') nav_editor;
    @ViewChild('navTop') nav_top;
    @ViewChild('navGuide') nav_guide;
    @ViewChild('navGuideIcon') nav_guide_icon;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _scrollor: ScrollorService,
        private _nav_button: NavButtonService,
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
        this._nav_button.button_list = [{
            name: 'navEditor',
            icon: () => 'mode_edit',
            callback: event => this.go_editor(event),
            tool_tip: () => '编辑文章 (ctrl + E)',
        }, {
            name: 'navTop',
            icon: () => 'arrow_upward',
            callback: event => this._scrollor.goto_top(event),
            tool_tip: () => '回到顶部 (ctrl + ↑)',
        }];
    }

    show_nav_button(event) {
        if (event.type !== 'mousemove') {
            return event;
        }

        if (event.x < event.view.innerWidth - this.nav_zone_width * 1.5) {
            if (this.menu_anime_state === 'show') {
                this.toggle_menu();
            }
        }
    }

    toggle_menu(event?) {
        if (this.menu_anime_state === 'hidden') {
            if (!this.menu_anime_handler) {
                this.menu_anime_handler = anime.timeline().add({
                    targets: this.nav_editor._elementRef.nativeElement,
                    translateY: -70,
                    duration: 200,
                    opacity: [0, 1],
                    offset: 0,
                    easing: 'linear'
                }).add({
                    targets: this.nav_top._elementRef.nativeElement,
                    translateY: -130,
                    duration: 200,
                    opacity: [0, 1],
                    offset: 0,
                    easing: 'linear'
                }).add({
                    targets: this.nav_guide_icon._elementRef.nativeElement,
                    rotate: '0.5turn',
                    duration: 200,
                    // opacity: [0, 1],
                    offset: 0,
                    easing: 'linear'
                });
                console.log(this.nav_guide_icon._elementRef);
                this.menu_anime_handler.play();
            } else {
                this.menu_anime_handler.reverse();
                this.menu_anime_handler.play();
            }
            this.menu_anime_state = 'show';
        } else if (this.menu_anime_state === 'show') {
            if (event && event.type !== 'mouseenter' || !event) {
                this.menu_anime_handler.reverse();
                this.menu_anime_handler.play();
                this.menu_anime_state = 'hidden';
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

