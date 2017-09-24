import { Component, OnInit, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';

@Component({
  selector: 'la-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {


  @ViewChild('banner') banner;
  height = 100;
  constructor(
      private el: ElementRef,
      private nav_profile: NavProfileService
  ) { }

  ngOnInit() {
      this.nav_profile.navbarWidth = this.el.nativeElement.firstChild.clientWidth;
  }

  onscroll(event) {
      const scrollTop = event.target.scrollingElement.scrollTop;
      if (scrollTop <= this.height) {
          this.banner.nativeElement.firstElementChild.style.opacity = 1 - (scrollTop / this.height);
      } else {
          this.banner.nativeElement.firstElementChild.style.opacity = 0;
      }
  }
}
