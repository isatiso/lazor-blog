import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { Article, ArticleData } from 'public/data-struct-definition';

declare var Prism: any;

@Component({
    selector: 'la-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    animations: [
        trigger('childrenAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('void <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)')),
            transition('inactive <=> active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ])
    ]
})
export class ArticleComponent implements OnInit, OnDestroy {

    public article_exists = 'active';
    public render_latex: any;
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
        const article_id = this._activate_route.params['value']['id'];
        this.article_exists = 'active';
        this._article_db.fetch(article_id).subscribe(
            res => {
                this.render_latex = article_id;
            }
        );
    }

    ngOnDestroy() {
        this.article_exists = 'inactive';
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

    go_editor(event) {
        this._router.navigate(['/editor/' + this.current_article.article_id]);
    }

    go_top(event) {
        let total_height = document.scrollingElement.scrollTop;
        const delta = total_height / 15;
        if (total_height > 0) {
            const interval_handler = setInterval(() => {
                total_height -= delta;
                document.scrollingElement.scrollTop = total_height;
                if (total_height <= 0) {
                    clearInterval(interval_handler);
                }
            }, 15);
        }
    }

    go_home(event) {
        this._router.navigate(['/home/']);
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
        this.article_exists = 'inactive';
        setTimeout(() => {
            this._router.navigate(['/article/' + article_id]).then(() => { this.ngOnInit(); });
            document.scrollingElement.scrollTop = 0;
        }, 300);
    }
}

@Component({
    selector: 'la-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./article.component.scss']
})
export class PreviewComponent implements OnInit {
    public name = '';

    @ViewChild('Image') image;

    constructor(
        public dialogRef: MatDialogRef<PreviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        setTimeout(() => {
            this.dialogRef.updateSize(
                this.image.nativeElement.naturalWidth + 48 + 'px',
                this.image.nativeElement.naturalHeight + 48 + 'px');
        }, 0);
    }

    submit(event) {
        this.dialogRef.close();
    }
}
