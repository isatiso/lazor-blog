import { Directive, ElementRef, OnInit, Input } from '@angular/core';
import { MarkdownService } from 'service/markdown.service';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Directive({
    selector: 'markdown, [laMarkdown]'
})
export class MarkdownDirective implements OnInit {
    private _data: string;
    private _ticker_handler: any;

    constructor(
        private _markdown: MarkdownService,
        private _el: ElementRef,
    ) { }

    ngOnInit() {

    }

    @Input()
    set data(value: string) {
        this._data = value;
    }

    @Input()
    set renderLatex(value: any) {
        if (value) {
            this._markdown.render(this._el, this._data);
            this._markdown.latexRender(this._el.nativeElement);
        }
    }
}
