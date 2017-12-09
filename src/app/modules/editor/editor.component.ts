import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { SnackBarService } from 'service/snack-bar.service';
import { NavButtonService } from 'service/nav-button.service';
import { ScrollorService } from 'service/scrollor.service';
import { ArticleData, Category, Options } from 'public/data-struct-definition';

import anime from 'animejs';

declare var Prism: any;
declare var InputEvent: any;

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
            transition('* => active', animate('300ms cubic-bezier(0, 1, 1, 1)'))
        ]),
        trigger('progressAppear', [
            state('active', style({
                opacity: 1,
            })),
            state('inactive', style({
                opacity: 0,
            })),
            transition('* <=> active', animate('200ms cubic-bezier(0, 1, 1, 1)'))
        ]),
    ]
})
export class EditorComponent implements OnInit, OnDestroy {

    public page_appear = 'active';
    public content_rows = 0;
    public tab_select_value = 0;
    public render_latex = false;
    public progress_value = 0;
    public progress_state = 'inactive';
    public left_scroll_top = 0;
    public right_scroll_top = 0;
    private _nav_zone_width = 125;
    private _nav_zone_leave_width = 375;
    private _nav_show = false;
    private _last_category_id: string = null;

    @ViewChild('navView') nav_view;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;
    @ViewChild('navAddImage') nav_add_image;
    @ViewChild('navDelete') nav_delete;
    @ViewChild('navGuide') nav_guide;
    @ViewChild('navGuideIcon') nav_guide_icon;

    @ViewChild('editorContainer') editor_container;
    @ViewChild('imageForm') image_form;
    @ViewChild('imageUpload') image_upload;
    @ViewChild('titleRef') title_ref;
    @ViewChild('contentRef') content_ref;
    @ViewChild('progressBar') progress_bar;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _scrollor: ScrollorService,
        private _activate_route: ActivatedRoute,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _nav_button: NavButtonService,
        public snack_bar: SnackBarService,
        public dialog: MatDialog
    ) {

    }

    get outer_width(): number {
        return window.outerWidth;
    }

    get content(): string {
        return this.current_article.content;
    }

    set content(value: string) {
        this.current_article.content = value;
        this._article_db.article_status = 'modified';
        this.remove_extra_lines();
    }

    get title(): string {
        return this.current_article.title;
    }

    set title(value: string) {
        this.current_article.title = value;
        this._article_db.article_status = 'modified';
    }

    get tab_select(): number {
        return this.tab_select_value;
    }

    set tab_select(value: number) {
        if (value !== this.tab_select_value) {
            if (value === 1) {
                this.left_scroll_top = document.scrollingElement.scrollTop;
            } else if (value === 0) {
                this.right_scroll_top = document.scrollingElement.scrollTop;
            }
            this.tab_select_value = value;
        }
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
        if (this._activate_route.params['value']['id'] === 'new-article') {
            return this._article_db.on_edit_data.value;
        } else {
            return this._article_db.current_article;
        }
    }

    set current_article(source: ArticleData) {
        if (this._activate_route.params['value']['id'] === 'new-article') {
            this._article_db.on_edit_data.next(source);
        } else {
            this._article_db.current_article = source;
        }
    }

    private _before_unload = event => {
        const confirmMessage = '\\o/';
        if (this._article_db.article_status === 'modified') {
            event.returnValue = false;
            return false;
        } else {
            return;
        }
    }

    ngOnInit() {
        document.scrollingElement.scrollTop = 0;
        window.addEventListener('beforeunload', this._before_unload);

        const total_width = document.scrollingElement.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        const article_id = this._activate_route.params['value']['id'];

        this._nav_zone_width = Math.max((total_width - editor_width) / 2, 50);
        if (!this._category_db.init_status) {
            this._category_db.pull(new Options({ flush: true }));
        }
        this._article_db.article_status = 'saved';
        this.page_appear = 'active';

        if (article_id !== 'new-article') {
            this._article_db.fetch(article_id).subscribe(
                data => {
                    this._category_db.update_home(data.category_id);
                }
            );
        } else {
            // this._article_db.on_edit_data.next(new ArticleData({}));
        }

        this._last_category_id = this.current_category.category_id;
        this.remove_extra_lines();
        this.title_ref.nativeElement.focus();
        this._nav_button.button_list = [{
            name: 'navHome',
            icon: () => this.save_button_icon(),
            callback: event => this.save_button_click(),
            color: () => 'primary',
            tool_tip: () => this.save_button_outlet(),
        }, {
            name: 'navDelete',
            icon: () => 'delete',
            callback: event => this.delete_confirm(event),
            color: () => 'warn',
            tool_tip: () => '删除文章',
        }, {
            name: 'navAddImage',
            icon: () => 'insert_photo',
            callback: event => this.select_file_click(event),
            tool_tip: () => '添加图片 (ctrl + P)',
        }, {
            name: 'navView',
            icon: () => this.preview_button_icon(),
            callback: event => this.preview_button_click(event),
            tool_tip: () => this.preview_button_outlet(),
        }, {
            name: 'navTop',
            icon: () => 'arrow_upward',
            callback: event => this.go_top(),
            tool_tip: () => '回到顶部 (ctrl + ↑)',
        }];
    }

    ngOnDestroy() {
        this.page_appear = 'inactive';
        window.removeEventListener('beforeunload', this._before_unload);
    }

    remove_extra_lines() {
        this.content_rows = this.content.split('\n').length;
        setTimeout(() => {
            this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 28 - 2;
        }, 100);
    }

    go_top(event?) {
        this._scrollor.goto_top();
    }

    go_bottom(event?) {
        this._scrollor.goto_bottom();
    }

    go_home(event) {
        this._router.navigate(['/home']);
    }

    select_change(event) {
        this.tab_select = event;
        const current_scroll_top = document.scrollingElement.scrollTop;
        if (event === 1) {
            this.render_latex = true;
            setTimeout(() => {
                this._scrollor.goto(current_scroll_top, this.right_scroll_top, 30);
            }, 0);
        } else {
            this.render_latex = false;
            setTimeout(() => {
                this._scrollor.goto(current_scroll_top, this.left_scroll_top, 30);
            }, 0);
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
                    if (res['result']) {
                        this._article_db.fetch(res['data']['article_id']);
                        this._article_db.on_edit_data.next(new ArticleData({}));
                        this.snack_bar.show('Save Article Successfully.', 'OK', null);
                        this._category_db.clear_category_cache(this._last_category_id);
                        this._category_db.update_home(this.current_category.category_id, new Options({ flush: true }));
                        this._router.navigate(['/editor/' + res['data']['article_id']]);
                    }
                });
        } else {
            this._http.post('/middle/article', {
                article_id: this.current_article.article_id,
                title: this.title,
                content: this.content,
                category_id: this.current_category.category_id,
            }).subscribe(
                res => {
                    if (res['result']) {
                        this._article_db.current_article = new ArticleData(res['data']);
                        this.snack_bar.show('Save Article Successfully.', 'OK', null);
                        if (this._last_category_id !== this.current_category.category_id) {
                            this._category_db.clear_category_cache(this._last_category_id);
                            this._last_category_id = this.current_category.category_id;
                            this._category_db.update_home(this.current_category.category_id, new Options({ flush: true }));
                        }
                    }
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

    delete_confirm(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.open(WarningComponent, {
            data: {
                msg: '彻底删除当前文章'
            }
        }).afterClosed().subscribe(res => {
            if (res) {
                this.delete_article();
            }
        });
        return false;
    }

    delete_article() {
        this._article_db.remove(this._article_db.current_article.article_id);
        this._category_db.update_home(this.current_category.category_id, new Options({ flush: true }));
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
        this._article_db.article_status = 'modified';
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
                    const content = `![${next.body['data']['file_name']}](${file_path} "${next.body['data']['file_name']}")\n`;

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
        if (this._article_db.article_status === 'modified') {
            this.save_article();
            this._article_db.article_status = 'saved';
        } else if (this._article_db.article_status === 'saved') {
            this.publish_article();
            this._article_db.article_status = 'published';
        } else if (this._article_db.article_status === 'published') {
            const params: NavigationExtras = {
                queryParams: { 'from': 'editor' },
            };
            this._router.navigate(['/article/' + this._article_db.current_article.article_id], params);
        }
    }

    save_button_icon() {
        if (this._article_db.article_status === 'modified') {
            return 'save';
        } else if (this._article_db.article_status === 'saved') {
            return 'publish';
        } else if (this._article_db.article_status === 'published') {
            return 'description';
        }
    }

    save_button_outlet() {
        switch (this._article_db.article_status) {
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
        this._article_db.article_status = 'modified';
    }

    unsaved() {
        return this._article_db.article_status === 'modified' ? '●' : '';
    }

    input_translate(event) {

        if (!(event.ctrlKey || event.key === 'Tab')) {
            return event;
        }
        if (event.key === 'Tab') {
            const content_index = this.content_ref.nativeElement.selectionStart;
            const left = this.content.slice(0, content_index);
            const right = this.content.slice(content_index);
            this.content_ref.nativeElement.value = left + '\t' + right;
            setTimeout(() => {
                this.content_ref.nativeElement.setSelectionRange(content_index + 1, content_index + 1);
            }, 0);
        } else if (event.ctrlKey && event.key === 'b') {
            const s = this.content_ref.nativeElement.selectionStart;
            const e = this.content_ref.nativeElement.selectionEnd;
            if (s === e) {
                return;
            }
            const left = this.content.slice(0, s);
            const content = this.content.slice(s, e);
            const right = this.content.slice(e);
            this.content = `${left}**${content}**${right}`;
            setTimeout(() => {
                this.content_ref.nativeElement.setSelectionRange(e + 4, e + 4);
            }, 0);
        } else if (event.ctrlKey && event.key === 'i') {
            const s = this.content_ref.nativeElement.selectionStart;
            const e = this.content_ref.nativeElement.selectionEnd;
            if (s === e) {
                return;
            }
            const left = this.content.slice(0, s);
            const content = this.content.slice(s, e);
            const right = this.content.slice(e);
            this.content = `${left}*${content}*${right}`;
            setTimeout(() => {
                this.content_ref.nativeElement.setSelectionRange(e + 2, e + 2);
            }, 0);
        } else {
            return event;
        }



        event.preventDefault();
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
            this.go_top(null);
        } else if (event.key === 'ArrowDown') {
            this.go_bottom(null);
        } else if (event.key === 's') {
            this.save_button_click();
        } else if (event.key === 'p') {
            this.select_file_click(null);
        } else {

            return event;
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

@Component({
    selector: 'la-warning',
    templateUrl: '../../public/warning.component.html',
    styleUrls: ['./editor.component.scss']
})
export class WarningComponent {
    public name = '';
    constructor(
        public dialogRef: MatDialogRef<WarningComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(false);
            return false;
        }
    }
}
