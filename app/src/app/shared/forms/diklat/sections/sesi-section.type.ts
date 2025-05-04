/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FieldArrayType } from '@ngx-formly/core';
import { finalize } from 'rxjs/operators';
import moment from 'moment';
import { DiklatService } from 'app/services/diklat.service';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'formly-repeat-section',
    templateUrl: './sesi-section.type.html'
})

export class SesiAddComponent extends FieldArrayType {
    viewLoading = false;
    constructor(
        private _diklatService: DiklatService,
        private router: Router,
        private _toastr: ToastrService,
    ) {
        super();
    }

    submit() {
        this.viewLoading = true;
        const submitValues = this.formControl.value;
        let submitted = 0;
        console.log('SesiAddComponent->submitValue', this.formControl.value);
        submitValues.forEach((queryParams) => {
            queryParams.startDate = moment(queryParams.startDate).format('YYYY-MM-DD');
            queryParams.endDate = moment(queryParams.endDate).format('YYYY-MM-DD');

            this._diklatService.sectionCreate(queryParams).pipe(finalize(() => {
                this.viewLoading = false;
            })).subscribe((res) => {
                if (res.success) {
                    submitted += submitted + 1;
                    this._toastr.success('Sesi `' + res.mapData.data.title + '` berhasil ditambahkan');
                }
            });
        });

        this.field.fieldGroup = [];

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(this.router.url);

        console.log('SesiAddComponent->submitted', submitted);
    }
}
