/* eslint-disable max-len */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from 'app/services/dashboard.service';
import { ApexOptions } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-statistik',
    templateUrl: './statistik.component.html',
    styles: [
        `
            apexcharts-legend {
                display: none !important;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatistikComponent implements OnInit, OnDestroy {
    chartJabatan: ApexOptions;
    chartBahasa: ApexOptions;
    chartGolongan: ApexOptions;
    chartProvinsi: ApexOptions;
    selectedProvinsi: string;
    colors = ['#118AB2', '#073B4C', '#F94144', '#EE4266', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#4D908E', '#577590', '#277DA1', '#EF476F', '#FFD166', '#06D6A0'];
    pnsList: Array<{ id: string; nama: string; nip: string; provinsiNama: string }> = [];
  errorMessage: string; // To hold any error messages
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _dashboardService: DashboardService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._dashboardService.all().subscribe();

        this._dashboardService.dashboard$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    const byGolongan = { 'labels': [], 'values': [] };
                    const byJenjangJabatan = { 'labels': [], 'values': [] };
                    const byBahasa = { 'labels': [], 'values': [] };
                    const byProvinsi = { 'labels': [], 'values': [] };

                    item.jumlahJFP.byBahasa.forEach((e) => {
                        byBahasa['labels'].push(e.label);
                        byBahasa['values'].push(e.jumlah);
                    });
                    item.jumlahJFP.byGolongan.forEach((e) => {
                        byGolongan['labels'].push(e.label);
                        byGolongan['values'].push(e.jumlah);
                    });
                    item.jumlahJFP.byJenjangJabatan.forEach((e) => {
                        byJenjangJabatan['labels'].push(e.label);
                        byJenjangJabatan['values'].push(e.jumlah);
                    });
                    item.jumlahJFP.byProvinsi.forEach((e) => {
                        byProvinsi['labels'].push(e.label);
                        byProvinsi['values'].push(e.jumlah);
                    });
                    this._prepareJabatan(byJenjangJabatan);
                    this._prepareBahasa(byBahasa);
                    this._prepareGolongan(byGolongan);
                    this._prepareProvinsi(byProvinsi);
                    this._changeDetectorRef.markForCheck();
                }
            });

    }

    private _prepareJabatan(item): void {
        this.chartJabatan = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                width: '100%',
                type: 'bar',
                sparkline: {
                    enabled: true
                }
            },
            colors: this.colors,
            xaxis: {
                categories: item.labels
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    barHeight: '100%',
                    columnWidth: '100%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            series: [
                {
                    name: '',
                    data: item.values
                }
            ],
        };
    }

    private _prepareBahasa(item): void {
        this.chartBahasa = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                width: '100%',
                type: 'bar',
                sparkline: {
                    enabled: true
                }
            },
            colors: this.colors,
            xaxis: {
                categories: item.labels
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    barHeight: '100%',
                    columnWidth: '100%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            series: [
                {
                    name: '',
                    data: item.values
                }
            ],
        };
    }

    private _prepareGolongan(item): void {
        this.chartGolongan = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                width: '100%',
                type: 'bar',
                sparkline: {
                    enabled: true
                }
            },
            colors: this.colors,
            xaxis: {
                categories: item.labels
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    barHeight: '100%',
                    columnWidth: '100%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            series: [
                {
                    name: '',
                    data: item.values
                }
            ],
        };
    }

     private _prepareProvinsi(item): void {
        this.chartProvinsi = {
            chart: {
                height: 650,
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                type: 'bar',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const provinsiIndex = config.dataPointIndex;
                        const provinsiNama = item.labels[provinsiIndex];
                        this.getProvinsiData(provinsiNama);
                    }
                }
            },
            colors: this.colors,
            xaxis: {
                categories: item.labels
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '100%',
                    columnWidth: '100%',
                    distributed: true,
                    rangeBarOverlap: true,
                }
            },
            dataLabels: {
                enabled: true
            },
            legend: {
                show: false
            },
            series: [
                {
                    name: '',
                    data: item.values
                }
            ],
        };
    }

   getProvinsiData(provinsiNama: string): void {
    this._dashboardService.getByProvinsi(provinsiNama).subscribe({
        next: (response) => {
            if (response.success) {
                this.pnsList = response.mapData.pnsList;
                this.errorMessage = ''; // Bersihkan pesan kesalahan sebelumnya
            } else {
                this.errorMessage = 'Error fetching data: ' + response.message;
            }
            this._changeDetectorRef.detectChanges(); // Deteksi perubahan secara langsung
        },
        error: (err) => {
            this.errorMessage = 'Error fetching data: ' + err.message;
            this._changeDetectorRef.detectChanges(); // Deteksi perubahan saat error
        }
    });
}



}
