import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { NavProfileService } from 'service/nav-profile/nav-profile.service';
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
            // transition('void => 0', animate('0ms ease-in')),
            transition('1 <=> 0', animate('0ms ease-in'))
        ]),
    ]
})
export class HomeComponent implements OnInit, OnDestroy {

    home_exists = 'active';
    displayedColumns = [
        'title',
        'author',
        'create_time'
    ];
    articleDatabase = new ArticleDatabase();
    dataSource: ArticleDataSource | null;
    categories = [];
    step = 0;
    new_category_name = null;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private snack_bar: MatSnackBar,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.home_exists = 'active';
        this.query_category();
        this.dataSource = new ArticleDataSource(this.articleDatabase);
        this.articleDatabase.dataChange.next(
            [{
                article_id: '',
                title: 'asdasdasdasdasdasdasdasdasdasdasdasd',
                content: '',
                author_id: '',
                category: 'default',
                author: 'plank',
                create_time: 123123123123
            }]
        );
    }

    ngOnDestroy() {
        this.home_exists = 'inactive';
    }

    setStep(i) {
        this.step = i;
    }

    click_category(event) {
        console.log('click_category');
        event.stopPropagation();
        console.log(event);
        return false;
    }

    query_category() {
        this._http.get('/middle/category').subscribe(
            res => {
                this.categories = res['data'];
            }
        );
    }

    add_category() {
        const dialogRef = this.dialog.open(AddCategoryComponent, {
            height: '250px',
            width: '300px',
            data: {
                name: ''
            }
        });

        dialogRef.afterClosed().subscribe(
            res => {
                if (res) {
                    this._http.put(
                        '/middle/category', { name: res }
                    ).subscribe(
                        add_category_data => {
                            console.log(add_category_data);
                            this.query_category();
                        }
                        // error => {
                        //     const navigationExtras: NavigationExtras = {
                        //         queryParams: {
                        //             'message': 'Sorry, We can not contact chat server now.',
                        //             'sub_message': 'Contact Administrator to fix that.'
                        //         }
                        //     };
                        //     this._router.navigate(['/error'], navigationExtras);
                        // }
                        );
                }
            });
    }

    delete_category(category_id) {
        if (!category_id) {
            return;
        }
        this._http.delete('/middle/category?category_id=' + category_id).subscribe(
            res => {
                console.log(res);
                this.query_category();
            }
        );
    }

    get_article_id() {
        this._http.get('/middle/generate-id').subscribe(
            res => {
                console.log('generate_id', res['data']['generate_id']);
                this._router.navigate(['/editor/' + res['data']['generate_id']]);
            }
        );
    }
}
export interface ArticleData {
    article_id: string;
    title: string;
    author_id: string;
    category: string;
    content: string;
    author: string;
    create_time: number;
}

export class ArticleDatabase {
    dataChange: BehaviorSubject<ArticleData[]> = new BehaviorSubject<ArticleData[]>([]);

    get data(): ArticleData[] { return this.dataChange.value; }

    constructor() {
    }
}

export class ArticleDataSource extends DataSource<any> {
    constructor(private _exampleDatabase: ArticleDatabase) {
        super();
    }

    connect(): Observable<ArticleData[]> {
        return this._exampleDatabase.dataChange;
    }

    disconnect() { }
}

@Component({
    selector: 'la-add-category',
    templateUrl: './add-category.component.html',
    styleUrls: ['./home.component.scss']
})
export class AddCategoryComponent {
    public nickname = '';
    constructor(
        public dialogRef: MatDialogRef<AddCategoryComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }
}
