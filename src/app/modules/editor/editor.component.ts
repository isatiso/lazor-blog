import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { SnackBarService } from 'service/snack-bar/snack-bar.service';
import { Category } from 'public/data-struct-definition';

declare var Prism: any;

@Component({
    selector: 'la-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    animations: [
        trigger('childrenAppear', [
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

    editor_exists = 'active';
    progress_value = 0;
    render_latex = false;
    article_object = {};
    public title_data = '';
    public content_data = '';
    public content_rows = 0;
    public user_name = window.localStorage.getItem('user_name');
    public article_create_time = '';
    public current_category: Category;
    public current_category_id = '';
    public categories = [];
    public article_id = '';
    public min_rows = 5;
    public max_rows = 20;
    public dynamic_height = true;
    public tab_position = 'bellow';
    public anchor_tip = { name: 'top' };
    public element: any;
    public tab1: any;
    public tab_height_1: number;
    public tab_height_2: number;
    public tab2: any;
    public tab_select = 0;
    public show_scroll: boolean;
    public current_article_id = '';
    public options;
    public progress_state = 'inactive';
    private nav_zone_width = 125;
    private left_nav_show = false;
    private right_nav_show = false;
    private article_status = 'published';
    private current_scroll_top = 0;

    @ViewChild('navView') nav_view;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;
    @ViewChild('navAddImage') nav_add_image;
    // @ViewChild('navAddLatex') nav_add_latex;
    @ViewChild('editorContainer') editor_container;
    @ViewChild('imageForm') image_form;
    @ViewChild('imageUpload') image_upload;
    @ViewChild('titleRef') title_ref;
    @ViewChild('contentRef') content_ref;
    @ViewChild('progressBarContainer') progress_bar_container;
    @ViewChild('progressBar') progress_bar;
    @ViewChild('divEditor') div_editor;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _article_db: ArticleDatabaseService,
        public snack_bar: SnackBarService,
        public dialog: MatDialog,
        // public snack_bar: MatSnackBar,
    ) { }

    get content(): string {
        return this.content_data;
    }

    set content(value: string) {
        this.content_data = value;
        this.article_status = 'modified';
        this.content_rows = this.content.split('\n').length;
        setTimeout(() => {
            this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 28 - 2;
        }, 100);
    }

    get title(): string {
        return this.title_data;
    }

    set title(value: string) {
        this.title_data = value;
        this.article_status = 'modified';
    }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.article_id = this._activate_route.params['value']['id'];
        this.query_categories();
        this.progress_bar.color = 'accent';
        if (this.article_id === 'new-article') {
            const current_editor = JSON.parse(window.localStorage.getItem('current_editor'));
            if (current_editor) {
                this.content = current_editor['content'] ? current_editor['content'] : '';
                this.title = current_editor['title'] ? current_editor['title'] : '';
            } else {
                this.content = '';
                this.title = '';
            }
            const current_category = window.localStorage.getItem('current_category');
            this.current_category = current_category ? JSON.parse(current_category) : null;
            if (this.current_category) {
                this.current_category_id = this.current_category.category_id;
            }
            this.article_status = 'saved';
        } else {
            this._article_db.fetch(this.article_id).subscribe(
                data => {
                    this.article_object = data;
                    this.article_create_time = data['create_time'];
                    this.user_name = data['user_name'];
                    this.content = data['content'];
                    this.title = data['title'];
                    this.current_category = {
                        category_id: data['category_id'],
                        category_name: data['category_name'],
                        category_type: data['category_type'],
                        user_id: data['user_id']
                    };
                    this.current_category_id = data['category_id'];
                    this.article_status = 'saved';
                }
            );
        }

        const total_width = document.body.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        let nav_width = (total_width - editor_width) / 2;
        nav_width = nav_width > 50 ? nav_width : 50;
        this.editor_exists = 'active';
        setTimeout(() => {
            this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
        }, 100);
    }

    ngOnDestroy() {
        window.onkeydown = null;
        this.editor_exists = 'inactive';
        if (this.article_id === 'new-article') {
            const current_editor = { 'title': this.title, 'content': this.content };
            window.localStorage.setItem('current_editor', JSON.stringify(current_editor));
        }
    }

    figure_scroll_top() {
        if (this.element.scrollTop > 100) {
            this.show_scroll = true;
            return true;
        } else {
            this.show_scroll = false;
            return false;
        }
    }

    toggle_select(event) {
        if (this.tab_select === 1) {
            this.tab_select = 0;
        } else if (this.tab_select === 0) {
            this.tab_select = 1;
        }
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

    figure_button_name() {
        if (this.tab_select === 0) {
            return 'remove_red_eye';
        } else if (this.tab_select === 1) {
            return 'mode_edit';
        }
    }

    show_nav_button(event) {
        if (event.view.innerWidth - this.nav_zone_width / 3 <= event.x && event.x <= event.view.innerWidth) {
            if (!this.right_nav_show) {
                this.right_nav_show = true;
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-120px)';
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-60px)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(60px)';
            }
        } else if (event.view.innerWidth - this.nav_zone_width > event.x) {
            if (this.left_nav_show || this.right_nav_show) {
                this.left_nav_show = false;
                this.right_nav_show = false;
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(80%)';
            }
        }
    }

    save_article() {
        if (this.article_id === 'new-article') {
            this._http.put('/middle/article', {
                title: this.title,
                content: this.content,
                category_id: this.current_category_id,
            }).subscribe(
                res => {
                    this.article_id = res['data']['article_id'];
                    window.localStorage.setItem('current_editor', JSON.stringify({}));
                    this._router.navigate(['/editor/' + res['data']['article_id']]);
                    this.snack_bar.show('Save Article Successfully.', 'OK', null);
                });
        } else {
            this._http.post('/middle/article', {
                article_id: this.article_id,
                title: this.title,
                content: this.content,
                category_id: this.current_category_id,
            }).subscribe(
                res => {
                    this.snack_bar.show('Save Article Successfully.', 'OK', null);
                    this.article_object['title'] = this.title;
                    this.article_object['content'] = this.content;
                    this.article_object['category_id'] = this.current_category_id;
                    window.sessionStorage.setItem('article-' + this.article_id, JSON.stringify(this.article_object));
                });
        }
    }

    publish_article() {
        this._http.post('/middle/article/publish-state', {
            article_id: this.article_id,
            publish_status: 1
        }).subscribe(
            res => {
                this.snack_bar.show('Publish Article Successfully.', 'OK', null);
            });
    }

    delete_article() {
        this._http.delete('/middle/article?article_id=' + this.article_id).subscribe(
            res => {
                this._router.navigate(['/home']);
            },
            error => {
            }
        );
    }

    query_categories() {
        this._http.get('/middle/category').subscribe(
            res => {
                if (res['data']) {
                    this.categories = res['data'];
                } else {
                    this.categories = [];
                }
            }
        );
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
        this.article_status = 'modified';
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
                    // this.content_ref.nativeElement.focus();
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

    set_content_rows_plus(event) {
        this.content_rows += 1;
    }

    set_content_rows(event) {
        this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
    }

    figure_modify_button() {
        if (this.article_status === 'modified') {
            return 'save';
        } else if (this.article_status === 'saved') {
            return 'publish';
        } else if (this.article_status === 'published') {
            return 'description';
        }
    }

    modify_button_move() {
        if (this.article_status === 'modified') {
            this.save_article();
            this.article_status = 'saved';
        } else if (this.article_status === 'saved') {
            this.publish_article();
            this.article_status = 'published';
        } else if (this.article_status === 'published') {
            this._router.navigate(['/article/' + this.article_id]);
        }
    }

    category_change(event) {
        this.article_status = 'modified';
    }

    save_action(event) {
        event.preventDefault();
        return false;
    }

    change_tab(event) {
        if (!event.ctrlKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 's')) {
            return event;
        }
        if (event.key === 'ArrowLeft') {

            this.tab_select = 0;
            setTimeout(() => { this.content_ref.nativeElement.focus(); }, 0);
        } else if (event.key === 'ArrowRight') {
            this.content_ref.nativeElement.blur();
            this.tab_select = 1;
        } else if (event.key === 's') {
            this.modify_button_move();
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
