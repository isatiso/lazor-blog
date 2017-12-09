import { Injectable, Input } from '@angular/core';

@Injectable()
export class NavProfileService {
    private width: number;
    primary_color: '#ffffff';
    constructor() { }

    set navbarWidth(value) {
        this.width = value;
    }

    get navbarWidth() {
        return this.width;
    }
}
