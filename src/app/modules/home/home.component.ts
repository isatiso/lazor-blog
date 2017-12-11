import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

import { SortablejsOptions } from 'angular-sortablejs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// service
import { NavProfileService } from 'service/nav-profile.service';
import { CategoryDatabaseService, CategorySource } from 'service/category-database.service';
import { AccountService } from 'service/account.service';
import { ScrollorService } from 'service/scrollor.service';
import { NoticeService } from 'service/notice.service';
import { NavButtonService } from 'service/nav-button.service';

import { ArticleData, Category, Options, NavButton } from 'public/data-struct-definition';

import anime from 'animejs';

@Component({
    selector: 'la-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)')),
            transition('inactive <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('sortState', [
            state('1', style({
                borderRadius: '5px',
                backgroundColor: '#e0f7fa'
            })),
            state('0', style({
                borderRadius: '0px',
                backgroundColor: '#fff'
            })),
            transition('1 <=> 0', animate('200ms ease-in'))
        ]),
        trigger('showCate', [
            state('1', style({
                transform: 'translateX(0)',
            })),
            state('0', style({
                transform: 'translateX(-100%)',
            })),
            transition('void => 0', animate('200ms linear')),
            transition('0 <=> 1', animate('200ms linear'))
        ]),
        trigger('loadArticle', [
            state('1', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition('void => 1', animate('200ms cubic-bezier(0, 1, 1, 1)')),
            transition('0 => 1', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('infoAppear', [
            state('1', style({
                opacity: 1
            })),
            transition('void <=> 1', animate('200ms cubic-bezier(0, 1, 1, 1)')),
            // transition('0 => 1', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('showOptions', [
            state('options', style({
                transform: 'translateX(-45%)',
            })),
            state('current', style({
                transform: 'translateX(-5%)',
            })),
            state('none', style({
                transform: 'translateX(0)',
            })),
            transition('* <=> *', animate('200ms cubic-bezier(0, 1, 1, 1)')),
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    page_appear = 'active';
    displayedColumns = ['title'];
    dataSource: CategorySource | null;
    can_sort: boolean;
    load_article: boolean;
    current_card = 'left';

    public menu_anime_handler: any;
    public menu_anime_state = 'hidden';
    private _touch_state = null;
    public show_cate_state = 0;
    private _focusTrap: FocusTrap;

    article_sort_options_data: SortablejsOptions = {
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

    category_sort_options_data: SortablejsOptions = {
        animation: 100,
        disabled: false,
        onStart: event => {
            event.item.style.opacity = 0;
            this._category_db.clear_push_article_order();
        },
        onEnd: event => {
            event.item.style.opacity = 1;
            this._category_db.push_category_order();
        },
    };

    sortable_disabled_data: SortablejsOptions = {
        disabled: true
    };

    article_sort_options: SortablejsOptions;
    category_sort_options: SortablejsOptions;

    @ViewChild('smallViewLeft') small_view_left;
    @ViewChild('smallViewRight') small_view_right;
    @ViewChild('categoryListPad') category_list_pad;
    @ViewChild('navCate') nav_cate;
    @ViewChild('navTop') nav_top;
    @ViewChild('navGuide') nav_guide;
    @ViewChild('navGuideIcon') nav_guide_icon;

    constructor(
        private _http_client: HttpClient,
        private _router: Router,
        private _account: AccountService,
        private _category_db: CategoryDatabaseService,
        private _scrollor: ScrollorService,
        private _notice: NoticeService,
        private _focusTrapFactory: FocusTrapFactory,
        private _nav_button: NavButtonService,
    ) { }

    get outer_width(): number {
        return window.outerWidth;
    }

    get categories() {
        return this._category_db.category_list;
    }

    set categories(source: Category[]) {
        this._category_db.category_list = source;
    }

    get user_name() {
        return this._account.data ? this._account.data.user_name : '';
    }

    get article_list(): ArticleData[] {
        return this._category_db.home_list;
    }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        this.page_appear = 'active';
        this.dataSource = new CategorySource(this._category_db, 'home');
        this.article_sort_options = this.sortable_disabled_data;
        this.category_sort_options = this.sortable_disabled_data;
        this.can_sort = false;
        this.load_article = true;
        this.query_category();
        this._nav_button.button_list = [{
            name: 'navToggle',
            icon: () => 'view_list',
            callback: event => this.toggle_show_cate(),
            tool_tip: () => '编辑文章 (ctrl + E)',
        }, {
            name: 'navCreate',
            icon: () => 'create',
            callback: event => this.go_create_article(),
            tool_tip: () => '写新文章'
        }, {
            name: 'navCreateCategory',
            icon: () => 'create_new_folder',
            callback: event => this.input_category(),
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

    is_current(category) {
        return this._category_db.current_category.category_id === category.category_id;
    }

    show_options(category) {
        if (!this.can_sort && this.is_current(category)) {
            if (this._category_db.current_category.show_options === 1) {
                return 'options';
            } else {
                return 'current';
            }
        } else {
            return 'none';
        }
    }

    set_step(category) {
        if (!this.is_current(category)) {
            this._category_db.current_category.show_options = 0;
            this._category_db.update_home(category['category_id']);
            this.load_article = false;
            setTimeout(() => { this.load_article = true; }, 0);
        } else {
            this.toggle_button();
        }
    }

    set_sortable(event) {
        if (event.checked) {
            this.article_sort_options = this.article_sort_options_data;
            this.category_sort_options = this.category_sort_options_data;
            this.can_sort = true;
        } else {
            this.article_sort_options = this.sortable_disabled_data;
            this.category_sort_options = this.sortable_disabled_data;
            this.can_sort = false;
        }
    }

    toggle_button() {
        this._category_db.current_category.show_options ^= 1;
    }

    query_category() {
        this._category_db.pull(new Options({ flush: true }));
    }

    input_category() {
        this._notice.input(
            {
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
                this.add_category(data.category_name.value);
            });
    }

    add_category(category_name) {
        if (category_name) {
            this._http_client.put(
                '/middle/category', { category_name: category_name }
            ).subscribe(
                res => {
                    this.query_category();
                });
        }
    }

    modify_category(event, category) {
        event.stopPropagation();
        event.preventDefault();
        this._notice.input(
            {
                input_list: [{
                    name: 'category_name',
                    placeholder: 'Change Name of The Category',
                    value: category.category_name
                }]
            }, data => {
                if (!data) { return; }
                this._http_client.post(
                    '/middle/category', {
                        category_id: category.category_id,
                        category_name: data.category_name.value
                    }
                ).subscribe(
                    update_category_data => {
                        this.query_category();
                    });
            });

        return false;
    }

    delete_confirm(event, category_id) {
        event.stopPropagation();
        event.preventDefault();
        this._notice.warn(
            {
                msg: '删除分类以及分类中所有的文章'
            },
            res => {
                if (res) {
                    this.delete_category(category_id);
                }
            }
        )
        return false;
    }

    delete_category(category_id) {
        if (!category_id) {
            return;
        }
        this._http_client.delete(
            '/middle/category?category_id=' + category_id
        ).subscribe(
            res => {
                this.query_category();
            });
    }

    toggle_show_cate(event?) {
        if (event && !event.target.className.split(' ').find((res) => res === 'category-card-container')) {
            return event;
        }

        if (this.show_cate_state === 1) {
            this.show_cate_state = 0;
            this._focusTrap && this._focusTrap.destroy();
        } else {
            this.show_cate_state = 1;
        }
    }

    go_create_article(event?) {
        this._router.navigate(['/editor/new-article']);
    }
}

