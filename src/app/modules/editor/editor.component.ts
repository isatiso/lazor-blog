import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MarkdownDirective } from 'directive/markdown.directive';
import { ArticleDatabaseService } from 'service/article-database.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { NoticeService } from 'service/notice.service';
import { LoggingService } from 'service/logging.service';
import { NavButtonService } from 'service/nav-button.service';
import { ScrollorService } from 'service/scrollor.service';
import { ArticleData, Category, Options } from 'public/data-struct-definition';

@Component({
    selector: 'la-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    animations: [
        trigger('pageAppear', [
            state('1', style({
                opacity: 1,
            })),
            state('0', style({
                opacity: 0,
            })),
            transition('* => 1', animate('300ms cubic-bezier(0, 1, 1, 1)'))
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

    public page_appear = 0;
    public render_latex = 0;
    public progress_rate = 0;
    public progress_state = 'inactive';
    public tab_select_value = 0;

    @ViewChild('imageForm') image_form;
    @ViewChild('imageUpload') image_upload;
    @ViewChild('titleRef') title_ref;
    @ViewChild('contentRef') content_ref;
    @ViewChild('progressBar') progress_bar;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        private _log: LoggingService,
        private _scrollor: ScrollorService,
        private _article_db: ArticleDatabaseService,
        private _category_db: CategoryDatabaseService,
        private _nav_button: NavButtonService,
        private _notice: NoticeService,
    ) { }



    public source = {
        self: this,
        last_category_id: '',
        left_scroll_top: 0,
        right_scroll_top: 0,

        get outer_width(): number {
            return window.outerWidth;
        },
        get content(): string {
            return this.self._article_db.on_edit.content;
        },
        set content(value: string) {
            this.self._article_db.on_edit.content = value;
            this.self._article_db.article_status = 'modified';
        },
        get title(): string {
            return this.self._article_db.on_edit.title;
        },
        set title(value: string) {
            this.self._article_db.on_edit.title = value;
            this.self._article_db.article_status = 'modified';
        },
        get categories(): Category[] {
            return this.self._category_db.category_list;
        },
        get current_category(): Category {
            return this.self._category_db.current_category;
        },
        set current_category(source: Category) {
            this.self._category_db.current_category = source;
            this.self._article_db.article_status = 'modified';
        },

        set tab_select(value: number) {
            if (value !== this.self.tab_select_value) {
                if (value === 1) {
                    this.left_scroll_top = document.scrollingElement.scrollTop;
                } else if (value === 0) {
                    this.right_scroll_top = document.scrollingElement.scrollTop;
                }
                this.self.tab_select_value = value;
            }
        },
        get tab_select(): number {
            return this.self.tab_select_value;
        },
        select_change(event) {
            this.tab_select = event;
            const current_scroll_top = document.scrollingElement.scrollTop;
            if (event === 1) {
                this.self.render_latex = 1;
                setTimeout(() => {
                    this.self._scrollor.goto(current_scroll_top, this.right_scroll_top, 30);
                }, 0);
            } else {
                this.self.render_latex = 0;
                setTimeout(() => {
                    this.self._scrollor.goto(current_scroll_top, this.left_scroll_top, 30);
                }, 0);
            }
        },
    };

    public action = Object.assign(Object.create(this.source), {
        go_home(event?) {
            this.self._router.navigate(['/home']);
        },
        go_editor() {
            this.tab_select = 0;
            setTimeout(() => { this.self.content_ref.nativeElement.focus(); }, 0);
        },
        go_preview() {
            this.self.content_ref.nativeElement.blur();
            this.tab_select = 1;
        },
        go_top(event?) {
            this.self._scrollor.goto_top();
        },
        go_bottom(event?) {
            this.self._scrollor.goto_bottom();
        },
        set_modified(event) {
            this.self._article_db.article_status = 'modified';
        },
        is_unsaved() {
            return this.self._article_db.article_status === 'modified' ? '●' : '';
        },
        click_preview_button(event) {
            this.tab_select ^= 1;
        },
        click_save_button() {
            switch (this.self._article_db.article_status) {
                case 'modified':
                    this.save_article(); break;
                case 'saved':
                    this.publish_article();
                    this.self._article_db.article_status = 'published'; break;
                case 'published':
                    const params: NavigationExtras = {
                        queryParams: { 'from': 'editor' },
                    };
                    this.self._router.navigate(['/article/' + this.self._article_db.current_article.article_id], params);
                    break;
            }
        },
        click_upload_button(event?) {
            this.self.image_upload.nativeElement.click();
            return false;
        },
        click_delete_button(event) {
            event.stopPropagation();
            event.preventDefault();
            const result = this.self._notice.warn({
                msg: '彻底删除当前文章'
            }, res => {
                if (res) {
                    this.self._article_db.remove(this.self._article_db.current_article.article_id);
                    this.self._router.navigate(['/home']);
                }
            }).subscribe();
            return false;
        },
        save_article() {
            this.self._article_db.save({
                article_id: this.self._activate_route.params['value']['id'],
                title: this.title,
                content: this.content,
                category_id: this.self._category_db.current_category.category_id,
                last_category_id: this.last_category_id,
            });
        },
        publish_article() {
            this.self._article_db.publish_current_article();
        },
    });

    private info = Object.assign(Object.create(this.action), {
        save_button_icon() {
            switch (this.self._article_db.article_status) {
                case 'modified':
                    return 'save';
                case 'saved':
                    return 'publish';
                case 'published':
                    return 'description';
            }
        },
        save_button_outlet() {
            switch (this.self._article_db.article_status) {
                case 'modified':
                    return '保存文章 (ctrl + S)';
                case 'saved':
                    return '发布文章 (ctrl + S)';
                case 'published':
                    return '查看文章 (ctrl + S)';
                default:
                    return '';
            }
        },
        preview_button_icon() {
            switch (this.tab_select) {
                case 0:
                    return 'remove_red_eye';
                case 1:
                    return 'mode_edit';
            }
        },
        preview_button_outlet() {
            switch (this.tab_select) {
                case 0:
                    return '预览文章 (ctrl + →)';
                case 1:
                    return '编辑文章 (ctrl + ←)';
                default:
                    return '';
            }
        },
    });

    private tool = {
        split_content(content, pl, pr?) {
            pr = pr || pl;
            return [content.slice(0, pl), '', content.slice(pl, pr), '', content.slice(pr)];
        },

        concat_content(content_arr, pos1, pos3?) {
            pos3 = pos3 || '';
            content_arr[1] = pos1;
            content_arr[3] = pos3;
            return content_arr.join('');
        },
    };

    private _boss_key = Object.assign(Object.create(this.action), {
        ArrowLeft() {
            this.go_editor();
        },
        ArrowRight() {
            this.go_preview();
        },
        ArrowUp() {
            this.go_top();
        },
        ArrowDown() {
            this.go_bottom();
        },
        s() {
            this.click_save_button();
        },
        p() {
            this.click_upload_button(null);
        },
    });

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
        window.addEventListener('beforeunload', this._before_unload);
        this._activate_route.params.subscribe(value => {
            if (!this._category_db.init_status) {
                this._category_db.pull(new Options({ flush: true }));
            }

            this._article_db.update_on_edit(
                value.id
            ).subscribe(data => {
                this._log.send('editor/' + value.id, { des: '文章编辑页面', title: data.title });
            });

            document.scrollingElement.scrollTop = 0;
            this.page_appear = 1;
            this._article_db.article_status = 'saved';
            this.source.last_category_id = this._category_db.current_category.category_id;
            this.title_ref.nativeElement.focus();
        });

        this._nav_button.button_list = [{
            name: 'navHome',
            icon: () => this.info.save_button_icon(),
            callback: event => this.action.click_save_button(),
            color: () => 'primary',
            tool_tip: () => this.info.save_button_outlet(),
        }, {
            name: 'navDelete',
            icon: () => 'delete',
            callback: event => this.action.click_delete_button(event),
            color: () => 'warn',
            tool_tip: () => '删除文章',
        }, {
            name: 'navAddImage',
            icon: () => 'insert_photo',
            callback: event => this.action.click_upload_button(event),
            tool_tip: () => '添加图片 (ctrl + P)',
        }, {
            name: 'navView',
            icon: () => this.info.preview_button_icon(),
            callback: event => this.action.click_preview_button(event),
            tool_tip: () => this.info.preview_button_outlet(),
        }, {
            name: 'navTop',
            icon: () => 'arrow_upward',
            callback: event => this.action.go_top(),
            tool_tip: () => '回到顶部 (ctrl + ↑)',
        }];
    }

    ngOnDestroy() {
        window.removeEventListener('beforeunload', this._before_unload);
    }



    upload_file(event) {

        if (this.image_upload.nativeElement.files.length > 15) {
            this._notice.bar('最多同时上传 15 个文件');
            return false;
        }

        this._article_db.article_status = 'modified';

        const file = new FormData(this.image_form.nativeElement);
        this.image_upload.nativeElement.value = '';

        const req = new HttpRequest('PUT', '/middle/image', file, {
            reportProgress: true,
        });

        this.progress_bar.color = 'primary';
        this.progress_state = 'active';

        this._http.request(req).subscribe(
            next => {
                if (next.type === HttpEventType.UploadProgress) {
                    this.progress_rate = Math.round(100 * next.loaded / next.total);
                } else if (next instanceof HttpResponse) {
                    const e = this.content_ref.nativeElement.selectionEnd;
                    const text = next.body['data']['file_list'].map(fp => {
                        return `![${fp['name']}](https://lazor.cn${fp['path']} "${fp['name']}")\n`;
                    }).join('');

                    this.source.content = this.tool.concat_content(
                        this.tool.split_content(
                            this.source.content,
                            e), text);

                    this.progress_state = 'inactive';
                    setTimeout(() => {
                        this.content_ref.nativeElement.setSelectionRange(e + text.length, e + text.length);
                        this.progress_rate = 0;
                        this.progress_bar.color = 'accent';
                    }, 0);
                } else {
                    console.log(next);
                }
            },
            error => {
            }
        );
    }

    input_translate(event) {
        if (!(event.ctrlKey || event.key === 'Tab')) {
            return event;
        }

        const s = this.content_ref.nativeElement.selectionStart;
        const e = this.content_ref.nativeElement.selectionEnd;
        let n = 0;

        if (event.ctrlKey && (s === e)) {
            return event;
        }

        if (event.key === 'Tab') {
            n = 1;
            this.source.content = this.tool.concat_content(
                this.tool.split_content(
                    this.source.content, e), '\t');
        } else if (event.ctrlKey && event.key === 'b') {
            n = 4;
            this.source.content = this.tool.concat_content(
                this.tool.split_content(this.source.content, s, e), '**', '**');
        } else if (event.ctrlKey && event.key === 'i') {
            n = 2;
            this.source.content = this.tool.concat_content(
                this.tool.split_content(this.source.content, s, e), '*', '*');
        } else {
            return event;
        }

        setTimeout(() => {
            this.content_ref.nativeElement.setSelectionRange(e + n, e + n);
        }, 0);
        event.preventDefault();
    }

    boss_key_down(event) {
        if (event.ctrlKey && event.key in this._boss_key) {
            this._boss_key[event.key]();
            event.preventDefault();
        }
        return event;
    }
}
