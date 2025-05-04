import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { User } from 'app/core/user/user.types';
import { DiklatService } from 'app/services/diklat.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ActivityAttendanceDialogComponent } from './activity-attendance-dialog/activity-attendance-dialog.component';


@Component({
    selector: 'app-widget-activity-attendance',
    templateUrl: './activity-attendance.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityAttendanceComponent implements OnInit {
    @Input() item: any;
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private _matDialog: MatDialog,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
    }

    toggleAbsen(data): void {
        this.diklatService.getPosition().then((pos) => {
            if (!pos) {
                this.toastr.error('Anda tidak dapat melakukan Absen selama lokasi tidak terdeteksi');
            }
            this.diklatService.getLocation(pos.lat, pos.lng).subscribe((location) => {
                data.location = location;
                data.lng = pos.lng;
                data.lat = pos.lat;
                const dialogRef = this._matDialog.open(ActivityAttendanceDialogComponent, { data, autoFocus: false, width: '50%' });
                dialogRef.afterClosed().subscribe((result) => {
                    console.log('toggleAbsen', result);
                });
            });
        });
    }

}

