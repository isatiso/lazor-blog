import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { SortablejsOptions } from 'angular-sortablejs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { CategoryDatabaseService, CategorySource } from 'service/category-database/category-database.service';
import { AccountService } from 'service/account/account.service';
import { ArticleData, Category, Options } from 'public/data-struct-definition';

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
            transition('void <=> active', animate('300ms ease-in')),
            transition('inactive <=> active', animate('300ms ease-in'))
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
            transition('1 <=> 0', animate('200ms linear'))
        ]),
        trigger('loadArticle', [
            state('1', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition('void => 1', animate('200ms ease')),
            transition('0 => 1', animate('200ms ease'))
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
            transition('* <=> *', animate('200ms ease')),
            // transition('current <=> options', animate('200ms ease')),
            // transition('options <=> none', animate('200ms ease')),
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    page_appear = 'active';
    displayedColumns = ['title'];
    dataSource: CategorySource | null;
    can_sort: boolean;
    load_article: boolean;
    article_sort_options_data: SortablejsOptions = {
        animation: 50,
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
        animation: 50,
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

    constructor(
        private _http_client: HttpClient,
        private _router: Router,
        private _account: AccountService,
        private _category_db: CategoryDatabaseService,
        public dialog: MatDialog,
    ) { }

    get categories() {
        return this._category_db.category_list;
    }

    set categoried(source: Category[]) {
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
            this._category_db.update(category['category_id']);
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
        this.dialog.open(AddCategoryComponent, {
            data: {
                name: '',
                placeholder: 'Enter a New Name'
            }
        }).afterClosed().subscribe(name => { this.add_category(name); });
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
        this.dialog.open(AddCategoryComponent, {
            data: {
                name: category.category_name,
                placeholder: 'Change Name of The Category'
            }
        }).afterClosed().subscribe(
            res => {
                if (!res) { return; }

                this._http_client.post(
                    '/middle/category', {
                        category_id: category.category_id,
                        category_name: res
                    }
                ).subscribe(
                    update_category_data => {
                        this.query_category();
                    });
            });

        return false;
    }

    delete_category(event, category_id) {
        event.stopPropagation();
        event.preventDefault();
        if (!category_id) {
            return;
        }
        this._http_client.delete(
            '/middle/category?category_id=' + category_id
        ).subscribe(
            res => {
                this.query_category();
            });
        return false;
    }
}

@Component({
    selector: 'la-add-category',
    templateUrl: './add-category.component.html',
    styleUrls: ['./home.component.scss']
})
export class AddCategoryComponent {
    public name = '';
    constructor(
        public dialogRef: MatDialogRef<AddCategoryComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(this.data.name);
            return false;
        }
    }
}
