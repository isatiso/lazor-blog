import { Injectable, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Account } from 'public/data-struct-definition';

@Injectable()
export class AccountService {
    private account_data = new BehaviorSubject<Account>(null);

    constructor() { }

    set data(value: Account) {
        this.account_data.next(value);
    }

    get data() {
        return this.account_data.value;
    }
}

