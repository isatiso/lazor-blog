import { Injectable, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class SnackBarService {

    constructor(
        private _snack_bar: MatSnackBar,
    ) { }

    show(message: string, action_name?: string, action?: () => {}) {
        const snack_ref = this._snack_bar.open(
            message,
            action_name,
            {
                duration: 2000
            }
        );
        snack_ref.onAction().subscribe(action);
    }
}

