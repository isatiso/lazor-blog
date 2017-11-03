import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MarkdownDirective } from 'directive/markdown.directive';
import { Category } from 'data-struct-definition';

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
        // trigger('navAppear', [
        //     state('active', style({
        //         opacity: 1
        //     })),
        //     transition('* => active', animate('300ms ease-in'))
        // ])
    ]
})
export class EditorComponent implements OnInit, OnDestroy {

    editor_exists = 'active';
    public title = '';
    public content = '';
    public content_rows = 0;
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
    private nav_zone_width = 125;
    private left_nav_show = false;
    private right_nav_show = false;
    private article_status = 'published';
    private current_scroll_top = 0;

    // @ViewChild('navLeft') nav_left;
    @ViewChild('navView') nav_view;
    @ViewChild('navTop') nav_top;
    @ViewChild('navHome') nav_home;
    @ViewChild('navAddImage') nav_add_image;
    @ViewChild('navAddLatex') nav_add_latex;
    @ViewChild('editorContainer') editor_container;
    @ViewChild('imageForm') image_form;
    @ViewChild('imageUpload') image_upload;
    @ViewChild('titleRef') title_ref;
    @ViewChild('contentRef') content_ref;
    @ViewChild('divEditor') div_editor;

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _activate_route: ActivatedRoute,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        document.body.scrollTop = 0;
        this.article_id = this._activate_route.params['value']['id'];
        this.query_categories();
        if (this.article_id === 'new-article') {
            const current_editor = JSON.parse(window.localStorage.getItem('current_editor'));
            if (current_editor) {
                this.content = current_editor['content'] ? current_editor['content'] : '';
                this.title = current_editor['title'] ? current_editor['title'] : '';
            } else {
                this.content = '';
                this.title = '';
            }
            this.current_category = JSON.parse(window.localStorage.getItem('current_category'));
            if (this.current_category) {
                this.current_category_id = this.current_category.category_id;
            }
        } else {
            this._http.get('/middle/article?article_id=' + this.article_id).subscribe(
                res => {
                    if (!res['result'] && res['status'] === 4004) {
                        this._router.navigate(['/home']);
                        return;
                    }
                    console.log(res);
                    this.content = res['data']['content'];
                    this.title = res['data']['title'];
                    this.current_category = {
                        category_id: res['data']['category_id'],
                        category_name: res['data']['category_name'],
                        category_type: res['data']['category_type'],
                        user_id: res['data']['user_id']
                    };
                    this.current_category_id = res['data']['category_id'];
                },
                error => {
                    console.log(error);
                }
            );

        }


        const total_width = document.body.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        let nav_width = (total_width - editor_width) / 2;
        nav_width = nav_width > 50 ? nav_width : 50;
        // this.nav_left.nativeElement.style.width = nav_width + 'px';
        // this.nav_right.nativeElement.style.width = nav_width + 'px';
        this.editor_exists = 'active';
        // console.log(this.nav_left);
        // this.nav_left.nativeElement.style.width
        setTimeout(() => {
            this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
        }, 100);
        console.log('content', this.content);
    }

    ngOnDestroy() {
        this.editor_exists = 'inactive';
        if (this.article_id === 'new-article') {
            const current_editor = { 'title': this.title, 'content': this.content };
            window.localStorage.setItem('current_editor', JSON.stringify(current_editor));
        }
    }

    // scroll_top() {
    //     this._scrollor.scroll_top(this.element);
    // }

    // scroll_bottom() {
    //     this._scrollor.scroll_bottom(this.element);
    // }

    // figure_pos() {
    //     this._scrollor.figure_pos(this.element);
    // }

    figure_scroll_top() {
        if (this.element.scrollTop > 100) {
            this.show_scroll = true;
            return true;
        } else {
            this.show_scroll = false;
            return false;
        }
    }

    select1() {
        this.tab_select = 0;
    }

    select2() {
        this.tab_select = 1;
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
            Prism.highlightAll(false);
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
        if (event.type !== 'mousemove') {
            return event;
        }

        if (event.view.innerWidth - this.nav_zone_width / 3 <= event.x && event.x <= event.view.innerWidth) {
            if (!this.right_nav_show) {
                this.right_nav_show = true;
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-120px)';
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(-60px)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5)';
                this.nav_add_latex._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(60px)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(-30%) scale(1.5) translateY(120px)';


            }
        } else if (event.view.innerWidth - this.nav_zone_width > event.x) {
            if (this.left_nav_show || this.right_nav_show) {
                this.left_nav_show = false;
                this.right_nav_show = false;
                this.nav_view._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_top._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_home._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_add_image._elementRef.nativeElement.style.transform = 'translateX(80%)';
                this.nav_add_latex._elementRef.nativeElement.style.transform = 'translateX(80%)';
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
                    console.log(res);
                    this.article_id = res['data']['article_id'];
                    window.localStorage.setItem('current_editor', JSON.stringify({}));
                    this._router.navigate(['/editor/' + res['data']['article_id']]);
                });
        } else {
            this._http.post('/middle/article', {
                article_id: this.article_id,
                title: this.title,
                content: this.content,
                category_id: this.current_category_id,
            }).subscribe(
                res => {
                    console.log(res);
                });
        }
    }

    publish_article() {
        this._http.post('/middle/article/publish-state', {
            article_id: this.article_id,
            publish_state: 1
        }).subscribe(
            res => {
                console.log(res);
            });
    }

    delete_article() {
        this._http.delete('/middle/article?article_id=' + this.article_id).subscribe(
            res => {
                console.log('success');
                this._router.navigate(['/home']);
            },
            error => {
                console.log('error', error);
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
        this._http.put('/middle/file', file).subscribe(
            res => {
                console.log('content', this.content);
                const content_index = this.content_ref.nativeElement.selectionStart;
                const file_path = 'https://lazor.cn' + res['data']['file_path'];
                const left = this.content.slice(0, content_index);
                const right = this.content.slice(content_index);
                this.content = left + '![' + res['data']['file_name'] + '](' + file_path + ')\n' + right;
                this.content_ref.nativeElement.focus();
                setTimeout(() => {
                    const pos = content_index + 2;
                    const pos2 = pos + res['data']['file_name'].length;
                    this.content_ref.nativeElement.setSelectionRange(pos, pos2);
                }, 0);
            }
        );
    }

    set_modify_status(event) {
        this.article_status = 'modified';
        // console.log(this.content_ref.nativeElement.style.height);
        if (event.keyCode === 'Enter') {
            // this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
            this.content_rows += 1;
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            this.content_rows = this.content.split('\n').length;
            // console.log('tmp content rows', this.content_rows, this.content_ref);
            setTimeout(() => {
                this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
                // this.content_rows = this.content.split('\n').length;
            }, 100);
        }
        // console.log('content_rows', this.content_rows);
    }

    set_content_rows_plus(event) {
        this.content_rows += 1;
        console.log(this.content_rows);
    }

    set_content_rows(event) {
        this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18 - 2;
    }

    set_scroll_top(event) {
        // console.log(event);
        // this.current_scroll_top = document.body.scrollTop;
        // console.log('onscroll', this.current_scroll_top);
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

    resetChange(e) {
        this.content_rows = this.content_ref.nativeElement.style.height.slice(0, -2) / 18;
        console.log('change');
    }

    insert_latex(event) {
        this.dialog.open(InputComponent, {
            width: '700px',
            data: {
                name: '',
                placeholder: 'Enter Latex Code.'
            }
        }).afterClosed().subscribe(
            res => {
                if (res) {
                    this.article_status = 'modified';
                    const escaped_string = encodeURIComponent(res).replace(
                        /[!'()*]/g,
                        (char) => {
                            return '%' + char.charCodeAt(0).toString(16);
                        });
                    const latex_string = 'https://latex.codecogs.com/gif.latex?' + escaped_string;
                    const content_index = this.content_ref.nativeElement.selectionStart;
                    const left = this.content.slice(0, content_index);
                    const right = this.content.slice(content_index);
                    this.content = left + '![' + res + '](' + latex_string + ')\n' + right;
                    this.content_ref.nativeElement.value = left + '![' + res + '](' + latex_string + ')\n' + right;
                    this.content_ref.nativeElement.focus();
                    setTimeout(() => {
                        const pos = content_index + 2;
                        const pos2 = pos + res.length;
                        this.content_ref.nativeElement.setSelectionRange(pos, pos2);
                    }, 0);
                }
            });
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
