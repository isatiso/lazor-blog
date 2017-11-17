import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'la-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
    public name = '';

    @ViewChild('Image') image;

    constructor(
        public dialogRef: MatDialogRef<PreviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        setTimeout(() => {
            this.dialogRef.updateSize(
                this.image.nativeElement.naturalWidth + 48 + 'px',
                this.image.nativeElement.naturalHeight + 48 + 'px');
        }, 0);
    }

    submit(event) {
        this.dialogRef.close();
    }
}
