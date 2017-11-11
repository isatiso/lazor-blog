import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { CategoryDatabaseService, CategorySource } from 'service/category-database/category-database.service';
import { AccountService } from 'service/account/account.service';
import { ArticleData, Category } from 'public/data-struct-definition';

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
            transition('void <=> 1', animate('300ms ease-in')),
            transition('1 <=> 0', animate('300ms ease-in'))
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    page_appear = 'active';
    displayedColumns = ['title'];
    dataSource: CategorySource | null;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _account: AccountService,
        private _category_db: CategoryDatabaseService,
        public dialog: MatDialog,
    ) { }

    get categories() {
        return this._category_db.category_list;
    }

    get user_name() {
        return this._account.data ? this._account.data.user_name : '';
    }

    ngOnInit() {
        document.body.scrollTop = 0;
        const current_category_id = window.localStorage.getItem('current_category');
        this._category_db.update(window.localStorage.getItem('current_category'));
        this.page_appear = 'active';
        this.dataSource = new CategorySource(this._category_db, 'home');
        this._category_db.pull(true);
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
        window.localStorage.setItem('current_category', this._category_db.current_category_id);
    }

    set_step(category) {
        this._category_db.update(category['category_id']);
    }

    is_current(category) {
        return this._category_db.is_current(category.category_id);
    }

    query_category() {
        this._category_db.pull(true);
    }

    input_category() {
        this.dialog.open(AddCategoryComponent, {
            data: {
                name: '',
                placeholder: 'Enter a New Name'
            }
        }).afterClosed().subscribe(this.add_category);
    }

    add_category(category_name) {
        if (category_name) {
            this._http.put(
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
                    this._http.post(
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
        this._http.delete('/middle/category?category_id=' + category_id).subscribe(
            res => {
                this.query_category();
            }
        );
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
