import { NgModule } from '@angular/core';
import { MarkdownDirective } from 'directive/markdown.directive';
@NgModule({
    declarations: [
        MarkdownDirective
    ],
    exports: [
        MarkdownDirective
    ]
})
export class MarkdownModule { }
