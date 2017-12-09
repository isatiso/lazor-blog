import { Directive, ElementRef, OnInit, Input } from '@angular/core';
import { MarkdownService } from 'service/markdown.service';

@Directive({
    selector: 'markdown, [laMarkdown]'
})
export class MarkdownDirective implements OnInit {
    private _data: string;

    constructor(
        private _markdown: MarkdownService,
        private el: ElementRef,
    ) { }

    ngOnInit() {

    }

    @Input()
    set data(value: string) {
        if (value !== null) {
            this._data = value;
            this.onDataChange(value);
        }
    }

    @Input()
    set renderLatex(value: any) {
        if (value) {
            this._markdown.latexRender(this.el.nativeElement);
        }
    }

    onDataChange(data: string) {
        if (data) {
            this.el.nativeElement.innerHTML = this._markdown.compile(data);
        } else {
            this.el.nativeElement.innerHTML = '';
        }
    }
}
