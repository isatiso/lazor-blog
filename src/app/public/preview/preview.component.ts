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
        console.log(this.image);
        setTimeout(() => {
            const h = this.image.nativeElement.naturalHeight;
            const w = this.image.nativeElement.naturalWidth;
            const W = window.innerWidth;
            const H = window.innerHeight;
            const rh = h / H;
            const rw = w / W;
            let r = (rh > rw ? rh : rw);
            r = r > 1 ? r : 1;
            this.dialogRef.updateSize(
                w / r + 48 + 'px',
                h / r + 48 + 'px');
        }, 0);
    }

    submit(event) {
        this.dialogRef.close();
    }
}
