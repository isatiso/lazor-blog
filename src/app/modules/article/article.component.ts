import { Component, Inject, OnInit, OnDestroy, AfterContentInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { Article } from 'data-struct-definition';

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
            transition('void => active', animate('300ms ease-in')),
            transition('inactive => active', animate('300ms ease-in'))
        ])
    ]
})
export class ArticleComponent implements OnInit, OnDestroy {

    article_exists = 'active';
    article_id: string;
    content: string;
    title: string;
    article_create_time: number;
    article_user_name: string;
    private nav_zone_width = 125;
    private right_nav_show = false;
    @ViewChild('navEditor') nav_editor;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.article_exists = 'active';
        this.article_id = this._activate_route.params['value']['id'];
        this._http.get('/middle/article?article_id=' + this.article_id).subscribe(
            res => {
                if (!res['result'] && res['status'] === 4004) {
                    const navigationExtras: NavigationExtras = {
                        queryParams: {
                            'message': 'Sorry, we can\'t find this article.',
                        }
                    };
                    this._router.navigate(['/error'], navigationExtras);
                    return;
                }
                console.log(res);
                this.content = res['data']['content'];
                this.title = res['data']['title'];
                this.article_create_time = res['data']['create_time'] * 1000;
                this.article_user_name = res['data']['username'];
            });
    }

    ngOnDestroy() {
        this.article_exists = 'inactive';
    }

    show_nav_button(event) {
        if (event.type !== 'mousemove') {
            return event;
        }

        if (event.view.innerWidth - this.nav_zone_width / 3 <= event.x && event.x <= event.view.innerWidth) {
            if (!this.right_nav_show) {
                this.right_nav_show = true;
                this.nav_editor._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-60px)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(60px)';
            }
        } else if (event.view.innerWidth - this.nav_zone_width * 1.5 > event.x) {
            if (this.right_nav_show) {
                this.right_nav_show = false;
                this.nav_editor._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(80%)';
            }
        }
    }

    goto_editor(event) {
        this._router.navigate(['/editor/' + this.article_id]);
    }

    goto_top(event) {
        let total_height = document.body.scrollTop;
        const delta = total_height / 15;
        if (total_height > 0) {
            const interval_handler = setInterval(() => {
                total_height -= delta;
                document.body.scrollTop = total_height;
                if (total_height <= 0) {
                    clearInterval(interval_handler);
                }
            }, 15);
        }
    }

    goto_home(event) {
        this._router.navigate(['/home/']);
    }

    preview_image(event) {
        if (window['current_image']) {
            console.log('preview', window['current_image']);
            this.dialog.open(PreviewComponent, {
                data: {
                    name: '',
                    src: window['current_image']
                }
            }).afterClosed().subscribe(
                res => {
                    console.log('show up');
                }
                );
            window['current_image'] = null;
        }

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
