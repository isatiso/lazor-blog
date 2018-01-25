import { Injectable, Input } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { WarningComponent } from 'public/warning/warning.component';
import { InputDialogComponent } from 'public/input-dialog/input-dialog.component';
import { PreviewComponent } from 'public/preview/preview.component';
import { Observable } from 'rxjs/Observable';

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
                duration: 2000,
                verticalPosition: 'top'
            }
        );
        if (action) {
            snack_ref.onAction().map(action).catch(
                error => {
                    console.log(error); return new Observable();
                });
        }

    }

    input(data: any, callback: (res) => any) {
        return this._dialog.open(InputDialogComponent, {
            data: data
        }).afterClosed().map(callback).catch(
            (error, caught) => {
                console.log(error, caught); return new Observable();
            });
    }

    preview(data: any, callback: () => any) {
        console.log('data', data);
        return this._dialog.open(PreviewComponent, {
            data: data
        }).afterClosed().map(callback).catch(
            (error, caught) => {
                console.log(error, caught); return new Observable();
            });
    }

    warn(data: any, callback: (res) => any) {
        return this._dialog.open(WarningComponent, {
            data: data
        }).afterClosed().map(callback).catch(
            (error, caught) => {
                console.log(error, caught); return new Observable();
            });
    }
}

