import { Component, ElementRef, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavBgDirective } from 'directive/nav-bg.directive';

@Component({
    selector: 'la-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges, AfterViewInit {
    title = 'Lazor Blog';
    nav_bg = false;

    constructor(
        private el: ElementRef,
        private router: Router
    ) { }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    ngAfterViewInit() {
        console.log(this.router);
    }


    onscroll() {
        console.log(this.router);
        if (this.el.nativeElement.firstChild.scrollTop > 280) {
            this.nav_bg = true;
        } else {
            this.nav_bg = false;
        }
    }
}
