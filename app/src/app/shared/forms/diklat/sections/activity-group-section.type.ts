/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FieldArrayType } from '@ngx-formly/core';
import { finalize } from 'rxjs/operators';
import moment from 'moment';
import { DiklatService } from 'app/services/diklat.service';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'formly-repeat-activity-group',
	templateUrl: './activity-group-section.type.html'
})

export class ActivityGroupAddComponent extends FieldArrayType {
	viewLoading = false;
	selected = JSON.parse(localStorage.getItem('selectedSections'));
	constructor(
		private _diklatService: DiklatService,
		private router: Router,
        private toastr: ToastrService
	) {
		super();

	}

	submit() {
		this.viewLoading = true;
		const submitValues = this.formControl.value;
		let submitted = 0;
		submitValues.forEach((queryParams) => {
			queryParams.activityGroupDate = moment(queryParams.activityGroupDate).format('YYYY-MM-DD');
			queryParams.startTime = moment.utc(queryParams.startTime, 'HH:mm').format('HH:mm');
			queryParams.endTime = moment.utc(queryParams.endTime, 'HH:mm').format('HH:mm');
			queryParams.sectionId = this.selected.id;
			console.log('ActivityGroupAddComponent->queryParams', queryParams);
			this._diklatService.activityGroupCreate(queryParams).pipe(finalize(() => {
				this.viewLoading = false;
				// localStorage.removeItem('selectedSections');
			})).subscribe((res) => {
				if (res.success) {
					submitted += submitted + 1;
                    this.toastr.success('Sesi `' + res.mapData.data.title + '` berhasil ditambahkan');
				} else {
                    this.toastr.success('ERROR: `' + res.message + '`');
				}
				console.log('ActivityGroupAddComponent->return', res);
			});
		});

		this.field.fieldGroup = [];

		this.router.routeReuseStrategy.shouldReuseRoute = () => false;
		this.router.onSameUrlNavigation = 'reload';
		this.router.navigateByUrl(this.router.url);

		console.log('ActivityGroupAddComponent->submitted', submitted);
	}
}
