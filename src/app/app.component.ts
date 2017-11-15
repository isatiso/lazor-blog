import { Component, ElementRef, Inject, OnInit, OnChanges, AfterViewInit, AfterViewChecked, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { NavBgDirective } from 'directive/nav-bg.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { AccountService } from 'service/account/account.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
@Component({
    selector: 'la-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('navBarAnimation', [
            state('active', style({
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            transition('void <=> active', animate('300ms ease-in'))
        ]),
    ]
})
export class AppComponent implements OnInit {
    navbar_exists = 'active';
    children_appear = 'active';
    title = 'Lazor Blog';
    scroll_top = 0;
    height_limit = 0;
    client_width = 0;
    navbarWidth = 0;
    constructor(
        private el: ElementRef,
        private router: Router,
        private _http: HttpClient,
        private activatedRoute: ActivatedRoute,
        private _account: AccountService,
        public dialog: MatDialog,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        public nav_profile: NavProfileService,
    ) { }

    get current_user(): string {
        if (this._account.data) {
            return this._account.data.user_name;
        } else {
            return 'Menu';
        }
    }

    ngOnInit() {
        window.sessionStorage.clear();
        if (this.router.url === '/home' || this.router.url === '/') {
            this.height_limit = 276;
        }
        this.router.events.filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            })
            .mergeMap(route => route.data)
            .subscribe((data) => {
                if (data['scrollLimit']) {
                    this.height_limit = data['scrollLimit'];
                } else {
                    this.height_limit = 0;
                }
            });
    }

    is_logged() {
        return this._account.data !== null;
    }

    onscroll(event) {
        this.scroll_top = event.target.scrollingElement.scrollTop;
        return event;
    }

    edit_profile() {
        this.dialog.open(ProfileComponent, {
            data: {
                name: this._account.data.user_name,
                placeholder: 'Enter a New Name'
            }
        }).afterClosed().subscribe(data => { this._account.update_username(data.name); });
    }

    log_out(event) {
        this._http.delete('/middle/user').subscribe(
            res => {
                this._account.data = null;
            }
        );
        this.router.navigate(['/auth']);
    }
}

@Component({
    selector: 'la-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./app.component.scss']
})
export class ProfileComponent {
    public name = '';
    constructor(
        public dialogRef: MatDialogRef<ProfileComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(this.data);
            return false;
        }
    }
}
