// angular module
import { Component, Input, OnInit, OnChanges, ViewChild, ViewChildren } from '@angular/core';

// non-angular module
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import anime from 'animejs';

// local module
import { NavProfileService } from 'service/nav-profile.service';
import { NavButton } from 'public/data-struct-definition';

@Component({
    selector: 'la-nav-button',
    templateUrl: './nav-button.component.html',
    styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit, OnChanges {

    public menu_anime_handler: any;
    public menu_anime_state = 'hidden';
    public button_list: NavButton[];
    public expand_width: string;

    @ViewChild('container') container;
    @ViewChild('navGuide') nav_guide;
    @ViewChild('navGuideIcon') nav_guide_icon;
    @ViewChildren('navOption') nav_options;

    @Input()
    set buttonList(bl: BehaviorSubject<NavButton[]>) {
        bl.subscribe(data => {
            this.button_list = data;
            this.menu_anime_handler = null;
            if (data) { this.expand_width = data.length * 64 + 48 + 'px'; }
        });
    }

    constructor() { }

    ngOnInit() {
        this.container.nativeElement.style.width = '56px';
        this.container.nativeElement.style.height = '56px';
    }

    ngOnChanges() {

    }

    toggle_menu(event?, state?: string) {
        if (event && event.type === 'mouseenter' && window.outerWidth <= 768) {
            return event;
        }

        if (!this.menu_anime_handler) {
            this.menu_anime_handler = anime.timeline();
            this.menu_anime_handler.add({
                targets: this.nav_guide_icon._elementRef.nativeElement,
                rotate: '0.5turn',
                duration: 200,
                offset: 0,
                easing: 'linear'
            }).add({
                targets: this.container.nativeElement,
                height: this.expand_width,
                duration: 200,
                offset: 0,
                easing: 'linear'
            });
            let delta = 0;
            this.nav_options.forEach(el => {
                delta -= 64;
                this.menu_anime_handler.add({
                    targets: el._elementRef.nativeElement,
                    translateY: delta,
                    duration: 200,
                    opacity: [0, 1],
                    offset: 0,
                    easing: 'linear'
                });
            });
            this.menu_anime_state = 'show';
        } else {
            if (state && state === this.menu_anime_state) {
                return false;
            } else if (state) {
                if (state === 'show') {
                    if (this.menu_anime_handler.reversed) {
                        this.menu_anime_handler.reverse();
                    }
                    this.menu_anime_handler.play();
                } else {
                    if (!this.menu_anime_handler.reversed) {
                        this.menu_anime_handler.reverse();
                    }
                    this.menu_anime_handler.play();
                }
                this.menu_anime_state = state;
            } else {
                this.menu_anime_handler.play();
                this.menu_anime_handler.reverse();
                if (this.menu_anime_state === 'hidden') {
                    this.menu_anime_state = 'show';
                } else {
                    this.menu_anime_state = 'hidden';
                }
            }
        }

        return true;
    }


}
