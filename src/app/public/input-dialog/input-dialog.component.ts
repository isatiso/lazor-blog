import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export class InputItem {
    name: string;
    placeholder: string;
    value: string;
    type: string;
    required: boolean;
}

@Component({
    selector: 'la-input-dialog',
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<InputDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            input_list: InputItem[]
        },
    ) { }

    assemble(data) {
        if (!data) { return; }
        const result = {};
        for (let i = 0; i < data.input_list.length; i++) {
            result[data.input_list[i].name] = data.input_list[i];
        }
        return result;
    }

    submit(event) {
        if (event.type === 'keyup' && event.key === 'Enter') {
            this.dialogRef.close(this.assemble(this.data));
            return false;
        }
    }
}
