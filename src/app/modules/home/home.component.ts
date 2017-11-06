import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { ArticleData, Category } from 'public/data-struct-definition';

@Component({
    selector: 'la-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('banner', [
            state('0', style({
                color: '#000000',
                opacity: 1,
            })),
            transition('void => 0', animate('500ms ease-in'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void => active', animate('300ms ease-in')),
            transition('inactive => active', animate('300ms ease-in'))
        ]),
        trigger('currentCategory', [
            state('1', style({
                backgroundColor: '#d0d0d0',
            })),
            state('0', style({
                backgroundColor: '#f0f0f0',
            })),
            transition('void => 1', animate('300ms ease-in')),
            transition('1 <=> 0', animate('300ms ease-in'))
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    home_exists = 'active';
    displayedColumns = ['title'];
    dataSource: ArticleDataSource | null;
    categories = [];
    current_category = null;
    current_category_id = '';
    operator_status = false;
    step = 0;
    new_category_name = null;
    user_name = '';
    @ViewChild('deleteBtn') deleteBtn;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _category_db: CategoryDatabaseService,
        private snack_bar: MatSnackBar,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.home_exists = 'active';
        this.dataSource = new ArticleDataSource(this._category_db);
        this.user_name = window.localStorage.getItem('user_name');
        const current_category = window.localStorage.getItem('current_category');
        this.current_category = current_category ? JSON.parse(current_category) : {};
        this.query_category_and_article();

    }

    ngOnDestroy() {
        this.home_exists = 'inactive';
        window.localStorage.setItem('current_category', JSON.stringify(this.current_category));
    }

    set_step(category) {
        if (this.current_category_id !== category['category_id']) {
            this.current_category = category;
            this.current_category_id = category['category_id'];
            this.query_article_list();
        }
        this.operator_status = false;
    }

    click_category(event) {
        event.stopPropagation();
        return false;
    }

    query_category() {
        const current_category = this.current_category;
        this._http.get('/middle/category').subscribe(
            res => {
                if (res['data']) {
                    this.categories = res['data'];
                    if (current_category) {
                        this.set_step(current_category);
                    } else {
                        this.set_step(this.categories[0]);
                    }
                } else {
                    this.categories = [];
                }
            }
        );
    }

    query_category_and_article() {
        this._http.get('/middle/category').subscribe(
            res => {
                if (res['data']) {
                    this.categories = res['data'];
                    const current_category_exists = this.categories.filter(
                        ctg => {
                            if (ctg['category_id'] === this.current_category['category_id']) {
                                return true;
                            }
                            return false;
                        }).length;
                    if (current_category_exists) {
                        this.set_step(this.current_category);
                    } else {
                        this.set_step(this.categories[0]);
                    }

                    this._category_db.update(this.current_category['category_id']);

                } else {
                    this.categories = [];
                }
            }
        );
    }

    add_category() {
        this.dialog.open(AddCategoryComponent, {
            data: {
                name: '',
                placeholder: 'Enter a New Name'
            }
        }).afterClosed().subscribe(
            res => {
                if (res) {
                    this._http.put(
                        '/middle/category', { category_name: res }
                    ).subscribe(
                        add_category_data => {
                            this.query_category();
                        });
                }
            });
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
                this.current_category = '';
                this.query_category();
            }
        );
    }

    get_article_id() {
        this._http.get('/middle/generate-id').subscribe(
            res => {
                // console.log('generate_id', res['data']['generate_id']);
                this._router.navigate(['/editor/' + res['data']['generate_id']]);
            }
        );
    }

    query_article_list() {
        this._category_db.update(this.current_category['category_id']);
    }

    print(event) {
        console.log(event);
    }
}

export class ArticleDataSource extends DataSource<any> {
    constructor(private _db: CategoryDatabaseService) {
        super();
    }

    connect(): Observable<ArticleData[]> {
        return this._db.dataExchange;
    }

    disconnect() { }
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
