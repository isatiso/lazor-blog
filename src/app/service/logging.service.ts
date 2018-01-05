import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MD5 } from 'public/lib/md5';

@Injectable()
export class LoggingService {
    private _md5 = new MD5();

    constructor(
        private _http: HttpClient,
    ) { }

    private _credit() {
        const cookies = document.cookie.split(';');
        let koo: any = cookies.find(
            item => {
                return item.trim().slice(0, 3) === 'koo';
            });
        if (!koo) {
            koo = ['blablabla|' + new Date().getTime()];
        } else {
            koo = koo.slice(5, -1).split('|');
        }
        const credit = koo[koo.length - 1];
        return this._md5.hex_md5(credit);
    }

    send(page: string, description?: object) {
        this._http.post(
            '/middle/log/credit',
            {
                credit: this._credit(),
                page: page,
                description: description
            }
        ).subscribe(
            res => {
                // console.log(res);
            });

    }
}
