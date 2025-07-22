import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagination } from 'app/modules/penerjemah/penerjemah.types';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-survey-statistik-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  items$: Observable<any[]>;
  pagination: Pagination;
  selected: any;
  displayedColumns: string[] = ['no', 'nip', 'nama', 'instansi', 'jabatan', 'hasAnswered', 'finishedTimeAt', 'finishedDateAt'];
  dataSource = new MatTableDataSource<any>();
  pageSize = 10;
  length = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  surveyId: string;
  surveyStatistics: any;
  surveyParticipants: any[] = [];
  surveyData: any; 

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _surveyKuisonerService: SurveyKuisonerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
      this.surveyId = params.get('id');
      if (this.surveyId) {
        console.log('Survey ID from route:', this.surveyId);
        this.loadSurveyStatistics();
        this.loadSurveyDetail();
        this.loadSurveyParticipants();
        // this.debugIds();
      }
    });
    this._surveyKuisonerService.getListparticipant(this.surveyId).subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
  }

  // Method untuk load survey detail berdasarkan feedbackId
  loadSurveyDetail(): void {
    this._surveyKuisonerService.getById(this.surveyId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          // Validasi response data
          if (data && typeof data === 'object') {
            this.surveyData = data;
            console.log('Survey detail loaded successfully:', this.surveyData);
          } else {
            console.error('Response data tidak valid:', data);
            this.surveyData = null;
          }
        },
        error: (error) => {
          console.error('Error loading survey detail:', error);
          console.error('Error detail:', error.message);
          console.error('Error stack:', error.stack);
          
          // Reset surveyData jika terjadi error
          this.surveyData = null;
        }
      });
  }

  // Load survey statistics menggunakan surveyId dari route
  loadSurveyStatistics(): void {
    console.log('Loading survey statistics with surveyId:', this.surveyId);
    
    this._surveyKuisonerService.getSurveyStatistics(this.surveyId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.surveyStatistics = data;
          console.log('Survey statistics loaded:', this.surveyStatistics);
        },
        error: (error) => {
          console.error('Error loading survey statistics:', error);
          console.error('Survey ID yang digunakan:', this.surveyId);
        }
      });
  }

  // Load survey suggestions menggunakan surveyId dari route
  loadSurveyParticipants(): void {
    console.log('Loading survey suggestions with surveyId:', this.surveyId);
    
    this._surveyKuisonerService.itemParticipants$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((item: any) => {
        console.log('item', item);
        if(item){
            this.dataSource = new MatTableDataSource(item.slice(0, this.pageSize));
            this.dataSource.paginator = this.paginator;
            this.length = item.length;
            this._changeDetectorRef.markForCheck();
        }
    });
  }

  togglePrint() {
    // const params = { ...this.form.getRawValue() };

    // Transform lists of objects to lists of IDs
    // if (params.byBahasa && params.byBahasa.length > 0) {
    //     params.byBahasa = params.byBahasa.map((bahasa: any) => bahasa.id);
    // } else {
    //     params.byBahasa = null;
    // }

    // if (params.byInstansiList && params.byInstansiList.length > 0) {
    //     params.byInstansiList = params.byInstansiList.map((instansi: any) => instansi.id);
    // } else {
    //     params.byInstansiList = null;
    // }

    // if (params.byJabatanList && params.byJabatanList.length > 0) {
    //     params.byJabatanList = params.byJabatanList.map((jabatan: any) => jabatan.id);
    // } else {
    //     params.byJabatanList = null;
    // }

    // if (params.byProvAlamatKantorList && params.byProvAlamatKantorList.length > 0) {
    //     params.byProvAlamatKantorList = params.byProvAlamatKantorList.map((provinsi: any) => provinsi.id);
    // } else {
    //     params.byProvAlamatKantorList = null;
    // }

    // Ensure other fields are correctly handled (e.g., set to null if empty string)
    // params.byNama = params.byNama || null;
    // params.byIsAktif = params.byIsAktif !== null ? params.byIsAktif : null;
    // params.bynamaPelatihan = params.bynamaPelatihan || null;
    // params.byTahunPelatihan = params.byTahunPelatihan || null;
    // params.byPeringkatPelatihan = params.byPeringkatPelatihan || null;
    // params.byJp = params.byJp || null;
    // params.byPredikatPelatihan = params.byPredikatPelatihan || null;
    // params.byPendidikan = params.byPendidikan || null;
    // params.byNamaSekolahPendidikan = params.byNamaSekolahPendidikan || null;
    // params.byJurusanPendidikan = params.byJurusanPendidikan || null;
    // params.byTahunLulusPendidikan = params.byTahunLulusPendidikan || null;
    // params.byUjiKompetensi = params.byUjiKompetensi || null;

    // Add sortBy and sort to the parameters for printing
    // params.sortBy = 'nama';
    // params.sort = 'ASC';

    // Add visible columns to the parameters
    // params.columnsToPrint = Object.keys(this.displayedColumns).filter(key => this.displayedColumns[key]);

    this._surveyKuisonerService.cetak(this.surveyId).subscribe(
        (result) => {
            const fileURL = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = 'daftar-hadir-survey.xlsx'; // ✅ nama file di sini
            a.click();
            URL.revokeObjectURL(fileURL);
        }, 
        (error) => {
            this._toastr.error('ERROR: cetak gagal', error);
        }
    );
}

  // Method untuk debugging - bisa dihapus setelah masalah resolved
  debugIds(): void {
    console.log('=== DEBUG INFO ===');
    console.log('Survey ID from route:', this.surveyId);
    console.log('Survey data:', this.surveyData);
  }

  formatDate(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) {
      return '';
    }
    const [year, month, day] = dateArray;
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  }

  formatTime(fullArray: number[]): string {
    if (!fullArray || fullArray.length < 6) {
      return '';
    }
  
    const [hour, minute, second] = fullArray.slice(3, 6);
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }
  
  onPageChanged(e) {
    const firstCut = e.pageIndex * e.pageSize;
    const secondCut = firstCut + e.pageSize;
    this.dataSource.data = this.selected.undanganDtoList.slice(firstCut, secondCut);
    this._changeDetectorRef.markForCheck();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}