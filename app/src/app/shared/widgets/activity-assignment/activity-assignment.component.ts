import { Component, ChangeDetectionStrategy, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DiklatService } from 'app/services/diklat.service';
import { ToastrService } from 'ngx-toastr';
import { SubmitAssignmentComponent } from './submit-assignment/submit-assignment.component';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


@Component({
    selector: 'app-widget-activity-assignment',
    templateUrl: './activity-assignment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityAssignmentComponent implements OnInit {
    @Input() item: any;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['nama', 'keterangan', 'feedback'];
    role: string = this._authService.role;
    constructor(
        private diklatService: DiklatService,
        private _authService: AuthService,
        private toastr: ToastrService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.diklatService.getAssignmentTask(this.item.id).subscribe((item: any) => {
            console.log(item);
            if(item.success){
                this.dataSource = new MatTableDataSource(item.mapData.assignments);
                this.dataSource.paginator = this.paginator;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    toggleSubmit(data): void {
        const dialogRef = this._matDialog.open(SubmitAssignmentComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleTestSet', result);
            if (result) {
                this.load();
            }
        });
    }

    load(): void {
        const parentUrl = this._router.url.split('/');
        this._diklatService.getPlayById(parentUrl[3]).subscribe();
    }

    download(dokumenId): void {
        this.diklatService.courseDocumentDownload(dokumenId).subscribe((blob: any) => {
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        });
    }

}

