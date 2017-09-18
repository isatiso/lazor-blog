import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
    selector: '[laNavBg]'
})
export class NavBgDirective implements OnInit {

    private height = 0;

    constructor(
        private el: ElementRef
    ) { }

    ngOnInit() {

    }

    @Input('background')
    set background(value: boolean) {
        if (value) {
            this.el.nativeElement.style.backgroundColor = '#3f51b5';
            this.el.nativeElement.style.backgroundImage = 'url(/assets/image/abs.png)';
            this.el.nativeElement.style.backgroundSize = '1920px';
            this.el.nativeElement.style.backgroundPositionY = '570px';
            this.el.nativeElement.style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.2)';
        } else {
            this.el.nativeElement.style.backgroundColor = 'transparent';
            this.el.nativeElement.style.backgroundImage = '';
            this.el.nativeElement.style.backgroundSize = '1920px';
            this.el.nativeElement.style.backgroundPositionY = '570px';
            this.el.nativeElement.style.boxShadow = '';
        }
    }
}
