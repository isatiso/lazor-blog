import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NoticeService } from 'service/notice.service';
import { Account } from 'public/data-struct-definition';

@Injectable()
export class DocumentService {

    constructor(
        private _http: HttpClient,
        private _router: Router,
        private _active_route: ActivatedRoute,
        private _notice: NoticeService,
    ) { }

    set title(title: string) {
        if (title) {
            document.title = `${title} - 板蓝根的技术栈`;
        } else {
            document.title = `板蓝根的技术栈`;
        }
    }

    get title(): string {
        return document.title;
    }
}

