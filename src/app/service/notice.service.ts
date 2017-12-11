import { Injectable, Input } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { WarningComponent } from 'public/warning/warning.component';
import { InputDialogComponent } from 'public/input-dialog/input-dialog.component';
import { PreviewComponent } from 'public/preview/preview.component';

@Injectable()
export class NoticeService {

    constructor(
        private _snack_bar: MatSnackBar,
        private _dialog: MatDialog
    ) { }

    bar(message: string, action_name?: string, action?: () => {}) {
        const snack_ref = this._snack_bar.open(
            message,
            action_name,
            {
                duration: 2000
            }
        );
        snack_ref.onAction().subscribe(action);
    }

    input(data: any, callback: (res) => any) {
        this._dialog.open(InputDialogComponent, {
            data: data
        }).afterClosed().subscribe(callback);
    }

    preview(data: any, callback: () => any) {
        this._dialog.open(PreviewComponent, {
            data: data
        }).afterClosed().subscribe(callback);
    }

    warn(data: any, callback: (res) => any) {
        this._dialog.open(WarningComponent, {
            data: data
        }).afterClosed().subscribe(callback);
    }
}

