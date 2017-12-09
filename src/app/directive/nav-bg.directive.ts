import { Directive, Input, ElementRef, OnInit, OnChanges, AfterViewInit, HostListener } from '@angular/core';
import { NavProfileService } from 'service/nav-profile.service';

@Directive({
    selector: '[laNavBg]'
})
export class NavBgDirective implements OnInit, OnChanges {

    private height = 0;
    private height_limit = 0;
    private scroll_top = 0;

    @Input() navWidth = 0;

    constructor(
        private el: ElementRef,
        public nav_profile: NavProfileService
    ) { }

    ngOnInit() {

    }

    ngOnChanges() {
        setTimeout(() => { this.el.nativeElement.style.width = 'calc(100% - ' + this.navWidth + 'px)'; }, 0);
    }

    // @Input('heightLimit')
    // set heightLimit(value) {
    //     this.height_limit = value;
    //     this.compare();
    // }

    // @Input('scrollTop')
    // set scrollTop(value) {
    //     this.scroll_top = value;
    //     this.compare();
    // }

    // compare() {
    //     if (this.scroll_top >= this.height_limit) {
    //         if (!this.el.nativeElement.style.boxShadow) {
    //             this.el.nativeElement.style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.2)';
    //         }
    //     } else {
    //         if (this.el.nativeElement.style.boxShadow) {
    //             this.el.nativeElement.style.boxShadow = '';
    //         }
    //     }
    // }
}
