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
        trigger('lightCategory', [
            state('1', style({
                backgroundColor: '#d0d0d0',
            })),
            state('0', style({
                backgroundColor: '#f0f0f0',
            })),
            transition('1 <=> 0', animate('300ms ease-in'))
        ]),
        trigger('showOptions', [
            state('1', style({
                transform: 'translateX(-40%)',
            })),
            state('0', style({
                transform: 'translateX(0)',
            })),
            transition('1 <=> 0', animate('100ms ease'))
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    page_appear = 'active';
    displayedColumns = ['title'];
    dataSource: CategorySource | null;
    sortable_options: SortablejsOptions = {
        onStart: event => {
            this._category_db.clear_push_order();
        },
        onEnd: event => {
            this._category_db.push_order();
        },
    };

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
        this.query_category();
        console.log(this);
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
    }

    set_step(category) {
        if (!this.is_current(category)) {
            this._category_db.current_category.show_options = 0;
            this._category_db.update(category['category_id']);
        } else {
            this.toggle_button();
        }

    }

    is_current(category) {
        return this._category_db.current_category.category_id === category.category_id;
    }

    show_options(category) {
        return this.is_current(category) && this._category_db.current_category.show_options === 1;
    }

    toggle_button() {
        if (this._category_db.current_category.show_options === 1) {
            this._category_db.current_category.show_options = 0;
        } else {
            this._category_db.current_category.show_options = 1;
        }
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
        console.log(this);
        console.log(category_name);
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
        this.dialog.open(AddCategoryComponent, {
            data: {
                name: category.category_name,
                placeholder: 'Change Name of The Category'
            }
        }).afterClosed().subscribe(
            res => {
                if (res) {
                    this._http_client.post(
                        '/middle/category', {
                            category_id: category.category_id,
                            category_name: res
                        }
                    ).subscribe(
                        update_category_data => {
                            this.query_category();
                        });
                }
            });
    }

    delete_category(category_id) {
        if (!category_id) {
            return;
        }
        this._http_client.delete('/middle/category?category_id=' + category_id).subscribe(
            res => {
                this.query_category();
            }
        );
    }

    move_up(category) {

    }

    move_down(category) {

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
