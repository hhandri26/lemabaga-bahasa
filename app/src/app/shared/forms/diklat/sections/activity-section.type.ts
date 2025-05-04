/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FieldArrayType } from '@ngx-formly/core';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DiklatService } from 'app/services/diklat.service';

@Component({
	selector: 'formly-repeat-activity',
	templateUrl: './activity-section.type.html',
	styles: [
		'::ng-deep .mat-form-field { padding-right: 10px !important; }',
		'.spacer { flex: 1 1 auto; }',
		'.kt-widget1 { padding: 0 !important; }',
		'.kt-widget1 .kt-widget1__item { border-bottom: 0.07rem dashed #000000 !important; }'
	]
})

export class ActivityAddComponent extends FieldArrayType {
	viewLoading = false;
	selected = JSON.parse(localStorage.getItem('selectedSections'));
	__documents$ = new BehaviorSubject<any[]>([]);
	// uploadDocument: Observable<any> = this.diklatService.courseDocumentUpload(file, queryParams).pipe();
	constructor(
		private _diklatService: DiklatService,
		private router: Router,
		private toastr: ToastrService
	) {
		super();
	}

	async uploadDocument(file, queryParams) {
		const body: FormData = new FormData();
		body.append('file', file, file.name);

		await this._diklatService.courseDocumentUpload(body).pipe().subscribe(
			(data) => {
				console.log('ActivityAddComponent->courseDocumentUpload-data', data);
				if (data.success) {
					this.__documents$.next(data);
					this.toastr.success('File' + file.name + ' berhasil diupload');
				} else {
					this.toastr.error('File ' + file.name + ' gagal diupload, ERROR : ' + data.message);
				}
			},
			err => this.toastr.error('File ' + file.name + ' gagal diupload, ERROR : ' + err.error.message)
		);
	}

	submit() {
		this.viewLoading = true;
		const submitValues = this.formControl.value;
		// console.log('ActivityAddComponent->submitValues', submitValues);
		console.log('ActivityAddComponent->model', this.model);
		console.log('ActivityAddComponent->selected', this.selected);

		// return;
		this.model.forEach((element) => {
			if (element.type === 'ASSIGNMENT') {
				this.saveAssignment(element);
			}

			if (element.type === 'URL') {
				this.saveURL(element);
			}

			if (element.type === 'ATTENDANCE') {
				this.saveAttendance(element);
			}

			if (element.type === 'MATERIAL') {
				this.saveMaterial(element);
			}

		});

		this.field.fieldGroup = [];

		this.router.routeReuseStrategy.shouldReuseRoute = () => false;
		this.router.onSameUrlNavigation = 'reload';
		this.router.navigateByUrl(this.router.url);
		return;
	}

	saveAttendance(element) {
		this._diklatService.activityAttendance({ activityGroupId: element.activityGroupId, dueDateCompletion: element.activityDate + ' ' + moment.utc(element.dueDateCompletion_ATTENDANCE.replace(':', ''), 'HH:mm').format('HH:mm') }).pipe().subscribe(
			(data) => {
				console.log('ActivityAddComponent->saveURL-data', data);
				if (data.success) {
					this.toastr.success('ATTENDANCE berhasil ditambahkan');
				} else {
					this.toastr.error('ATTENDANCE gagal ditambahkan, ERROR : ' + data.message);
				}
			},
			err => this.toastr.error('ATTENDANCE gagal ditambahkan, ERROR : ' + err.error.message)
		);
	}

	saveURL(element) {
		this._diklatService.activityURL({ activityGroupId: element.activityGroupId, keterangan: element.keterangan, link: element.link }).pipe().subscribe(
			(data) => {
				console.log('ActivityAddComponent->saveURL-data', data);
				if (data.success) {
					this.toastr.success('LINK ' + element.keterangan + ' berhasil ditambahkan');
				} else {
					this.toastr.error('LINK ' + element.keterangan + ' gagal ditambahkan, ERROR : ' + data.message);
				}
			},
			err => this.toastr.error('LINK ' + element.keterangan + ' gagal ditambahkan, ERROR : ' + err.error.message)
		);
	}

	saveAssignment(element) {
		for (let i = 0; i < element.file_ASSIGNMENT.length; i++) {
			const file = element.file_ASSIGNMENT[i];
			this.uploadDocument(file, { title: 'ASSIGNMENT : ' + file.name });
		}
		this.__documents$.subscribe((d: any) => {
			console.log('ActivityAddComponent->__documents', d);
			if (d) {
				if (d.success) {
					const documents = [];
					documents.push(d.mapData.data.id);
					this._diklatService.activityAssignment({
						activityGroupId: element.activityGroupId,
						documents, dueDateCompletion: element.activityDate + ' ' + moment.utc(element.dueDateCompletion_ASSIGNMENT.replace(':', ''), 'HH:mm').format('HH:mm')
					}).pipe().subscribe(
						(data) => {
							console.log('ActivityAddComponent->activityAssignment-data', data);
							if (data.success) {
								this.toastr.success('ASSIGNMENT ' + d.mapData.data.originalFilename + ' berhasil ditambahkan');
							} else {
								this.toastr.error('ASSIGNMENT ' + d.mapData.data.originalFilename + ' gagal ditambahkan, ERROR : ' + data.message);
							}
						},
						err => this.toastr.error('ASSIGNMENT ' + d.mapData.data.originalFilename + ' gagal ditambahkan, ERROR : ' + err.error.message)
					);
				}
			}
		});
	}

	saveMaterial(element) {
		if (element.materiType !== 'YOUTUBE') {
			for (let i = 0; i < element.file_MATERIAL.length; i++) {
				const file = element.file_MATERIAL[i];
				this.uploadDocument(file, { title: 'MATERIAL : ' + file.name });
			}
			this.__documents$.subscribe((d: any) => {
				console.log('ActivityAddComponent->__documents', d);
				if (d) {
					if (d.success) {
						const queryParams: any = {
							activityGroupId: element.activityGroupId,
							documentId: d.mapData.data.id, materiType: element.materiType
						};
						if (element.materiType === 'DOCUMENT'){
							queryParams.numPage = +element.totalPageVideo;
							queryParams.description = element.description;
						} else {
							queryParams.numDurationInMinute = +element.totalPageVideo;
						}
						this._diklatService.activityMaterial(queryParams).pipe().subscribe(
							(data) => {
								console.log('ActivityAddComponent->activityAssignment-data', data);
								if (data.success) {
									this.toastr.success('MATERIAL ' + d.mapData.data.originalFilename + ' berhasil ditambahkan');
								} else {
									this.toastr.error('MATERIAL ' + d.mapData.data.originalFilename + ' gagal ditambahkan, ERROR : ' + data.message);
								}
							},
							err => this.toastr.error('MATERIAL ' + d.mapData.data.originalFilename + ' gagal ditambahkan, ERROR : ' + err.error.message)
						);
					}
				}
			});
		} else {
			const queryParams = {
				activityGroupId: element.activityGroupId,
				materiType: element.materiType,
				videoId: element.video_id,
				link: element.link,
				numDurationInMinute: +element.totalPageVideo
			};
			this._diklatService.activityMaterial(queryParams).pipe().subscribe(
				(data) => {
					console.log('ActivityAddComponent->activityAssignment-YOUTUBE', data);
					if (data.success) {
						this.toastr.success('MATERIAL VIDEO Youtube berhasil ditambahkan');
					} else {
						this.toastr.error('MATERIAL VIDEO Youtube gagal ditambahkan, ERROR : ' + data.message);
					}
				},
				err => this.toastr.error('MATERIAL VIDEO Youtube gagal ditambahkan, ERROR : ' + err.error.message)
			);
		}
	}
}
