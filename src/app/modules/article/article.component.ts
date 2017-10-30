import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MarkdownDirective } from 'directive/markdown.directive';

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
    private nav_zone_width = 125;
    private right_nav_show = false;
    @ViewChild('navEditor') nav_editor;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.article_exists = 'active';
        this.article_id = this._activate_route.params['value']['id'];
        this._http.get('/middle/article?article_id=' + this.article_id).subscribe(
            res => {
                console.log(res);
                this.content = res['data']['content'];
                this.title = res['data']['title'];
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
                this.nav_editor._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(2)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(2) translateY(-60px)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(2) translateY(60px)';
            }
        } else if (event.view.innerWidth - this.nav_zone_width > event.x) {
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

}
