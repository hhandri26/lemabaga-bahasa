import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';

@Component({
    templateUrl: './approved.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovedComponent implements OnInit {
    constructor(
        public matDialogRef: MatDialogRef<ApprovedComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
    ) { }

    ngOnInit(): void {
    }
}
