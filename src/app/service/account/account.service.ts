import { Injectable, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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

export interface Account {
    user_id: string;
    user_name: string;
}
