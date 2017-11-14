import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { SnackBarService } from 'service/snack-bar/snack-bar.service';
import { ArticleData, Category, Options } from 'public/data-struct-definition';

declare var Prism: any;

@Component({
    selector: 'la-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('* => active', animate('300ms ease-in'))
        ]),
        trigger('progressAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('* <=> active', animate('200ms ease-out'))
        ]),
    ]
})
export class EditorComponent implements OnInit, OnDestroy {

    public page_appear = 'active';
    public content_rows = 0;
    public tab_select = 0;
    public render_latex = false;
    public progress_value = 0;
    public progress_state = 'inactive';
    private _article_status = 'published';
    private _nav_zone_width = 125;
    private _nav_show = false;

    @ViewChild('navView') nav_view;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;
    @ViewChild('navAddImage') nav_add_image;
    @ViewChild('editorContainer') editor_container;
    @ViewChild('imageForm') image_form;
    @ViewChild('imageUpload') image_upload;
    @ViewChild('titleRef') title_ref;
    @ViewChild('contentRef') content_ref;
    @ViewChild('progressBar') progress_bar;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        public snack_bar: SnackBarService,
        public dialog: MatDialog
    ) { }

    get content(): string {
        return this._article_db.current_article.content;
    }

    set content(value: string) {
        this._article_db.current_article_data.value.content = value;
        this._article_status = 'modified';
        this.remove_extra_lines();
    }

    get title(): string {
        return this._article_db.current_article.title;
    }

    set title(value: string) {
        this._article_db.current_article_data.value.title = value;
        this._article_status = 'modified';
    }

    get categories(): Category[] {
        return this._category_db.category_list;
    }

    get current_category(): Category {
        return this._category_db.current_category;
    }

    set current_category(source: Category) {
        this._category_db.current_category = source;
    }

    get current_article(): ArticleData {
        return this._article_db.current_article;
    }

    set current_article(source: ArticleData) {
        this._article_db.current_article = source;
    }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        const total_width = document.scrollingElement.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        const article_id = this._activate_route.params['value']['id'];

        this._nav_zone_width = Math.max((total_width - editor_width) / 2, 50);
        this._category_db.pull(new Options({ flush: true }));
        this._article_status = 'saved';
        this.page_appear = 'active';

        if (article_id !== 'new-article') {
            this._article_db.fetch(article_id).subscribe(
                data => {
                }
            );
        }

        this.remove_extra_lines();
        this.title_ref.nativeElement.focus();
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
    }

    remove_extra_lines() {
        this.content_rows = this.content.split('\n').length;
        setTimeout(() => {
            this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 28 - 2;
        }, 100);
    }

    goto_top(event) {
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

    goto_bottom(event) {
        const scroll_height = document.scrollingElement.scrollHeight;
        const client_height = document.scrollingElement.clientHeight;
        const scroll_range = scroll_height - client_height;
        let total_height = document.scrollingElement.scrollTop;
        const delta = (scroll_range - total_height) / 15;
        if (total_height < scroll_range) {
            const interval_handler = setInterval(() => {
                total_height += delta;
                document.scrollingElement.scrollTop = total_height;
                if (total_height >= scroll_range) {
                    clearInterval(interval_handler);
                }
            }, 15);
        }
    }

    goto_home(event) {
        this._router.navigate(['/home']);
    }

    select_change(event) {
        this.tab_select = event;
        if (event === 1) {
            this.render_latex = true;
            Prism.highlightAll(false);
        } else {
            this.render_latex = false;
        }
    }

    show_nav_button(event) {
        if (event.view.innerWidth - this._nav_zone_width / 3 <= event.x && event.x <= event.view.innerWidth) {
            if (!this._nav_show) {
                this._nav_show = true;
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-120px)';
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-60px)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(60px)';
            }
        } else if (event.view.innerWidth - this._nav_zone_width > event.x) {
            if (this._nav_show) {
                this._nav_show = false;
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(80%)';
            }
        }
    }

    save_article() {
        if (this._activate_route.params['value']['id'] === 'new-article') {
            this._http.put('/middle/article', {
                title: this.title,
                content: this.content,
                category_id: this.current_category.category_id,
            }).subscribe(
                res => {
                    this._article_db.current_article = new ArticleData(res['data']);
                    this.snack_bar.show('Save Article Successfully.', 'OK', null);
                    this._router.navigate(['/editor/' + res['data']['article_id']]);
                    this._category_db.update(this.current_category.category_id, new Options({ flush: true }));
                });
        } else {
            this._http.post('/middle/article', {
                article_id: this.current_article.article_id,
                title: this.title,
                content: this.content,
                category_id: this.current_category.category_id,
            }).subscribe(
                res => {
                    this._article_db.current_article = new ArticleData(res['data']);
                    this.snack_bar.show('Save Article Successfully.', 'OK', null);
                });
        }

    }

    publish_article() {
        this._http.post('/middle/article/publish-state', {
            article_id: this._article_db.current_article.article_id,
            publish_status: 1
        }).subscribe(
            res => {
                this.snack_bar.show('Publish Article Successfully.', 'OK', null);
            });
    }

    delete_article() {
        this._article_db.remove(this._article_db.current_article.article_id);
        this._category_db.update(this.current_category.category_id, new Options({ flush: true }));
        this._router.navigate(['/home']);
    }

    select_file(event) {
        if (!event.altKey) {
            return event;
        }
        event.preventDefault();
        this.image_upload.nativeElement.click();
        return false;
    }

    select_file_click(event) {
        this.image_upload.nativeElement.click();
        return false;
    }

    upload_file(event) {
        const file = new FormData(this.image_form.nativeElement);
        this._article_status = 'modified';
        this.image_upload.nativeElement.value = '';
        const req = new HttpRequest('PUT', '/middle/file', file, {
            reportProgress: true,
        });
        this.progress_bar.color = 'primary';
        this.progress_state = 'active';
        this._http.request(req).subscribe(
            next => {
                if (next.type === HttpEventType.UploadProgress) {
                    const percentDone = Math.round(100 * next.loaded / next.total);
                    this.progress_value = percentDone;
                } else if (next instanceof HttpResponse) {
                    const content_index = this.content_ref.nativeElement.selectionStart;
                    const file_path = 'https://lazor.cn' + next.body['data']['file_path'];
                    const left = this.content.slice(0, content_index);
                    const right = this.content.slice(content_index);
                    const content = `![${next.body['data']['file_name']}](${file_path})\n`;

                    this.content = left + content + right;
                    setTimeout(() => {
                        const pos = content_index + content.length;
                        this.content_ref.nativeElement.setSelectionRange(pos, pos);
                    }, 0);
                    this.progress_bar.color = 'accent';
                    this.progress_state = 'inactive';
                    setTimeout(() => { this.progress_value = 0; }, 200);
                }
            },
            error => {
            }
        );
    }

    save_button_click() {
        if (this._article_status === 'modified') {
            this.save_article();
            this._article_status = 'saved';
        } else if (this._article_status === 'saved') {
            this.publish_article();
            this._article_status = 'published';
        } else if (this._article_status === 'published') {
            this._router.navigate(['/article/' + this._article_db.current_article.article_id]);
        }
    }

    save_button_icon() {
        if (this._article_status === 'modified') {
            return 'save';
        } else if (this._article_status === 'saved') {
            return 'publish';
        } else if (this._article_status === 'published') {
            return 'description';
        }
    }

    save_button_outlet() {
        switch (this._article_status) {
            case 'modified':
                return '保存文章 (ctrl + S)';
            case 'saved':
                return '发布文章 (ctrl + S)';
            case 'published':
                return '查看文章 (ctrl + S)';
            default:
                return '';
        }
    }

    preview_button_click(event) {
        if (this.tab_select === 1) {
            this.tab_select = 0;
        } else if (this.tab_select === 0) {
            this.tab_select = 1;
        }
    }

    preview_button_icon() {
        if (this.tab_select === 0) {
            return 'remove_red_eye';
        } else if (this.tab_select === 1) {
            return 'mode_edit';
        }
    }

    preview_button_outlet() {
        switch (this.tab_select) {
            case 0:
                return '预览文章 (ctrl + →)';
            case 1:
                return '编辑文章 (ctrl + ←)';
            default:
                return '';
        }
    }

    article_change(event) {
        this._article_status = 'modified';
    }

    unsaved() {
        return this._article_status === 'modified' ? '●' : '';
    }

    boss_key(event) {
        const access_key = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            's',
            'p'
        ];

        if (!event.ctrlKey || access_key.indexOf(event.key) === -1) {
            return event;
        }
        if (event.key === 'ArrowLeft') {
            this.tab_select = 0;
            setTimeout(() => { this.content_ref.nativeElement.focus(); }, 0);
        } else if (event.key === 'ArrowRight') {
            this.content_ref.nativeElement.blur();
            this.tab_select = 1;
        } else if (event.key === 'ArrowUp') {
            this.goto_top(null);
        } else if (event.key === 'ArrowDown') {
            this.goto_bottom(null);
        } else if (event.key === 's') {
            this.save_button_click();
        } else if (event.key === 'p') {
            this.select_file_click(null);
        }
        event.preventDefault();
    }
}



@Component({
    selector: 'la-input',
    templateUrl: './input.component.html',
    styleUrls: ['./editor.component.scss']
})
export class InputComponent {
    public name = '';
    constructor(
        public dialogRef: MatDialogRef<InputComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(this.data.name);
            return false;
        }
    }
}
