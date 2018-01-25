import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { SortablejsOptions } from 'angular-sortablejs';

// service
import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { AccountService } from 'service/account.service';
import { LoggingService } from 'service/logging.service';
import { ScrollorService } from 'service/scrollor.service';
import { DocumentService } from 'service/document.service';
import { NoticeService } from 'service/notice.service';
import { NavButtonService } from 'service/nav-button.service';
import { URLEscapePipe } from 'urlescape/urlescape.pipe';

import { ArticleData, Category, Options, NavButton } from 'data-struct-definition';

@Component({
    selector: 'la-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('active', style({ opacity: 1, })),
            state('inactive', style({ opacity: 0, })),

            transition('void <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)')),
            transition('inactive <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('sortState', [
            state('1', style({ borderRadius: '5px', backgroundColor: '#e0f7fa' })),
            state('0', style({ borderRadius: '0px', backgroundColor: '#fff' })),

            transition('1 <=> 0', animate('200ms ease-in'))
        ]),
        trigger('showCate', [
            state('1', style({ transform: 'translateX(0)', })),
            state('0', style({ transform: 'translateX(-100%)', })),

            transition('void => 0', animate('200ms linear')),
            transition('0 <=> 1', animate('200ms linear'))
        ]),
        trigger('loadArticle', [
            state('1', style({ transform: 'translateX(0)', opacity: 1 })),

            transition('void => 1', animate('200ms cubic-bezier(0, 1, 1, 1)')),
            transition('0 => 1', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('infoAppear', [
            state('1', style({ opacity: 1 })),

            transition('void <=> 1', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('showOptions', [
            state('options', style({ transform: 'translateX(-45%)', })),
            state('current', style({ transform: 'translateX(-5%)', })),

            state('none', style({ transform: 'translateX(0)', })),
            transition('* <=> *', animate('200ms cubic-bezier(0, 1, 1, 1)')),
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    public page_appear = 'active';
    public can_sort = 0;
    public show_cate_state = 0;
    public load_article = 0;

    public article_sort_options: SortablejsOptions = {
        animation: 100,
        disabled: false,
        onStart: event => {
            event.item.style.opacity = 0;
            this._category_db.clear_push_article_order();
        },
        onEnd: event => {
            event.item.style.opacity = 1;
            this._category_db.push_article_order();
        },
    };

    public category_sort_options: SortablejsOptions = {
        animation: 100,
        disabled: false,
        onStart: event => {
            event.item.style.opacity = 0;
            this._category_db.clear_push_category_order();
        },
        onEnd: event => {
            event.item.style.opacity = 1;
            this._category_db.push_category_order();
        },
    };

    constructor(
        private _router: Router,
        private _log: LoggingService,
        private _doc: DocumentService,
        private _account: AccountService,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _scrollor: ScrollorService,
        private _notice: NoticeService,
        private _nav_button: NavButtonService,
    ) { }

    public source = {
        self: this,
        get outer_width(): number {
            return window.outerWidth;
        },
        get categories() {
            return this.self._category_db.category_list;
        },
        set categories(source: Category[]) {
            this.self._category_db.category_list = source;
        },
        get user_name() {
            return this.self._account.data ? this.self._account.data.user_name : '';
        },
        get article_list(): ArticleData[] {
            return this.self._category_db.home_list;
        }
    };

    public info = Object.assign(Object.create(this.source), {
        is_current(category) {
            return this.self._category_db.current_category.category_id === category.category_id;
        },
        show_options(category) {
            if (this.self.can_sort) {
                return 'none';
            } else if (!this.is_current(category)) {
                return 'none';
            } else if (this.self._category_db.current_category.show_options) {
                return 'options';
            } else {
                return 'current';
            }
        },
    });

    public action = Object.assign(Object.create(this.info), {

        toggle_show_cate(event?) {
            if (event && event.target.className.indexOf('category-card-container') === -1) {
                return event;
            }
            this.self.show_cate_state ^= 1;
        },

        toggle_sortable(event) {
            this.self.can_sort = event.checked;
            this.self.article_sort_options = Object.assign(Object.create({}),
                this.self.article_sort_options, { disabled: !event.checked });
            this.self.category_sort_options = Object.assign(Object.create({}),
                this.self.category_sort_options, { disabled: !event.checked });
        },

        set_current_category(category) {
            if (!this.is_current(category)) {
                this.self._category_db.current_category.show_options = 0;
                this.self._category_db.update_home(category['category_id']);
                this.self.load_article = 0;
                setTimeout(() => { this.self.load_article = 1; }, 0);
            } else {
                this.self._category_db.current_category.show_options ^= 1;
            }
        },

        create_article(event?) {
            this.self._article_db.create(this.self._category_db.current_category.category_id);
        },

        query_category() {
            this.self._category_db.pull(new Options({ flush: true }));
        },

        create_category() {
            this.self._notice.input({
                input_list: [{
                    name: 'category_name',
                    placeholder: 'Enter a New Name',
                    value: '',
                    required: true
                }, {
                    name: 'category_outline',
                    placeholder: 'Enter a Outline',
                    value: '',
                    required: false
                }]
            }, data => {
                if (!data) { return; }
                this.self._category_db.create(data.category_name.value);
            }).subscribe();
        },

        modify_category(event, category) {
            event.stopPropagation();
            event.preventDefault();
            this.self._notice.input({
                input_list: [{
                    name: 'category_name',
                    placeholder: 'Change Name of The Category',
                    value: category.category_name
                }]
            }, data => {
                if (!data) { return; }
                this.self._category_db.modify(category.category_id, data.category_name.value);
            }).subscribe();

            return false;
        },

        delete_category(event, category_id) {
            event.stopPropagation();
            event.preventDefault();
            this.self._notice.warn(
                {
                    msg: '删除分类以及分类中所有的文章'
                },
                res => {
                    if (res && category_id) {
                        this.self._category_db.delete(category_id);
                    }
                }
            ).subscribe();
            return false;
        },
    });

    ngOnInit() {
        this.action.query_category();
        this._doc.title = '主页';

        document.scrollingElement.scrollTop = 0;
        this._log.send('home', { des: '主页' });
        this.page_appear = 'active';
        this.article_sort_options = Object.assign(Object.create({}), this.article_sort_options, { disabled: true });
        this.category_sort_options = Object.assign(Object.create({}), this.category_sort_options, { disabled: true });
        this.load_article = 1;


        this._nav_button.button_list = [{
            name: 'navToggle',
            icon: () => 'view_list',
            callback: event => this.action.toggle_show_cate(),
            tool_tip: () => '编辑文章 (ctrl + E)',
        }, {
            name: 'navCreate',
            icon: () => 'create',
            callback: event => this.action.create_article(),
            tool_tip: () => '写新文章'
        }, {
            name: 'navCreateCategory',
            icon: () => 'create_new_folder',
            callback: event => this.action.create_category(),
            tool_tip: () => '添加分类'
        }, {
            name: 'navTop',
            icon: () => 'arrow_upward',
            callback: event => this._scrollor.goto_top(),
            tool_tip: () => '回到顶部 (ctrl + ↑)'
        }];
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
    }

}
