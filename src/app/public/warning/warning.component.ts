import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'la-warning',
    templateUrl: './warning.component.html',
    styleUrls: ['./warning.component.scss']
})
export class WarningComponent {
    public name = '';
    constructor(
        public dialogRef: MatDialogRef<WarningComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(false);
            return false;
        }
    }
}
