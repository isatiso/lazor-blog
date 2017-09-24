import { Component, OnInit, ViewChild } from '@angular/core';
import { MarkdownDirective } from 'directive/markdown.directive';

declare var Prism: any;

@Component({
    selector: 'la-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

    content = `
# this is a title
## this is also a title
> this is a quote

\`\`\` c
// this is some code

#include <stdio.h>

int main() {
    printf("hello world!");
}
\`\`\`
    `;

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

    @ViewChild('navLeft') nav_left;
    @ViewChild('navRight') nav_right;
    @ViewChild('editorContainer') editor_container;

    constructor() { }

    ngOnInit() {
        const total_width = document.body.clientWidth;
        const editor_width = this.editor_container.nativeElement.clientWidth;
        let nav_width = (total_width - editor_width) / 2;
        nav_width = nav_width > 50 ? nav_width : 50;
        this.nav_left.nativeElement.style.width = nav_width + 'px';
        this.nav_right.nativeElement.style.width = nav_width + 'px';
        // console.log(this.nav_left);
        // this.nav_left.nativeElement.style.width
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

}
