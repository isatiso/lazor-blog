import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MarkdownDirective } from 'directive/markdown.directive';

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
    ]
})
export class EditorComponent implements OnInit, OnDestroy {

    editor_exists = 'active';
    public title = '';
    public content = '';

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
    private nav_zone_width = 200;
    private left_nav_show = false;
    private right_nav_show = false;

    @ViewChild('navLeft') nav_left;
    @ViewChild('navRight') nav_right;
    @ViewChild('editorContainer') editor_container;

    constructor() { }

    ngOnInit() {
        const current_editor = JSON.parse(window.localStorage.getItem('current_editor'));
        this.content = current_editor['content'];
        this.title = current_editor['title'];
        const total_width = document.body.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        let nav_width = (total_width - editor_width) / 2;
        nav_width = nav_width > 50 ? nav_width : 50;
        // this.nav_left.nativeElement.style.width = nav_width + 'px';
        // this.nav_right.nativeElement.style.width = nav_width + 'px';
        this.editor_exists = 'active';
        // console.log(this.nav_left);
        // this.nav_left.nativeElement.style.width
    }

    ngOnDestroy() {
        this.editor_exists = 'inactive';
        const current_editor = { 'title': this.title, 'content': this.content };
        window.localStorage.setItem('current_editor', JSON.stringify(current_editor));
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

    select_change(event) {
        this.tab_select = event;
        if (event === 1) {
            Prism.highlightAll(false);
        }
    }

    show_nav_button(event) {
        // console.log(this.nav_left);
        // console.log(this.nav_right);
        if (event.type !== 'mousemove') {
            return event;
        }

        if (0 <= event.x && event.x <= this.nav_zone_width) {
            if (!this.left_nav_show) {
                // console.log('left');
                this.left_nav_show = true;
                this.nav_left._elementRef.nativeElement.style.transform = 'translateX(150%)';
            }
        } else if (event.view.innerWidth - this.nav_zone_width <= event.x && event.x <= event.view.innerWidth) {
            if (!this.right_nav_show) {
                // console.log('right');
                this.right_nav_show = true;
                this.nav_right._elementRef.nativeElement.style.transform = 'translateX(-150%)';
            }
        } else {
            if (this.left_nav_show || this.right_nav_show) {
                // console.log('back');
                this.left_nav_show = false;
                this.right_nav_show = false;
                this.nav_left._elementRef.nativeElement.style.transform = 'translateX(-300%)';
                this.nav_right._elementRef.nativeElement.style.transform = 'translateX(300%)';
                // console.log(event);
                // console.log(event.type, event.x, event.view.innerWidth);
            }
        }
    }
}
