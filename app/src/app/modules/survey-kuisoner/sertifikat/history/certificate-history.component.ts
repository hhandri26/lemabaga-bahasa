import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CertificateHistoryService } from './certificate-history.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-certificate-history',
  templateUrl: './certificate-history.component.html',
  styleUrls: ['./certificate-history.component.scss']
})
export class CertificateHistoryComponent implements OnInit, AfterViewInit {
  certificates: any[] = [];
  loading = false;
  
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['nomor_sertifikat', 'tipe', 'judul_sertifikat', 'subjudul_sertifikat', 'nama_partisipan', 'jam_pelajaran', 'tanggal_terbit', 'aksi'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(
    private certService: CertificateHistoryService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.certificates); // Initialize dataSource

    this.userService.user$.subscribe((user: User) => {
      if (user) {
        // Check if the user has the 'ROLE_ADMIN' role
        if (user.roles && user.roles.includes('ROLE_ADMIN')) {
          console.log('User has ADMIN role. Fetching all certificates.');
          this.fetchAllCertificates();
        } else if (user.email) {
          const userEmail = user.email;
          console.log('Logged-in user email:', userEmail);
          this.fetchCertificates(userEmail);
        } else {
          console.warn('User email not available from user service.');
        }
      } else {
        console.warn('User data not available from user service.');
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchString = filter.toLowerCase();

      // Check studyHours specifically
      if (data.studyHours !== undefined && data.studyHours !== null) {
        const studyHoursString = data.studyHours.toString();
        const studyHoursWithSuffix = studyHoursString + ' jam';
        if (studyHoursString.includes(searchString) || studyHoursWithSuffix.includes(searchString)) {
          return true;
        }
      }

      // Fallback to general string search for other fields
      const dataStr = JSON.stringify(data).toLowerCase();
      return dataStr.includes(searchString);
    };
  }

  fetchCertificates(email: string) {
    this.loading = true;
    this.certService.getCertificates(email).subscribe({
      next: (response) => {
        if (response.success && response.mapData && response.mapData.certificate) {
          this.certificates = response.mapData.certificate;
          this.dataSource.data = this.certificates; // Set data for MatTableDataSource
          console.log('Certificate Data (from backend):', this.certificates);
        } else {
          console.warn('Certificate data not found in response:', response);
          this.certificates = [];
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching certificates:', err);
        this.loading = false;
      }
    });
  }

  fetchAllCertificates() {
    this.loading = true;
    this.certService.getAllCertificates().subscribe({
      next: (response) => {
        if (response.success && response.mapData && response.mapData.certificate) {
          this.certificates = response.mapData.certificate;
          this.dataSource.data = this.certificates;
          console.log('All Certificate Data (from backend):', this.certificates);
        } else {
          console.warn('All certificate data not found in response:', response);
          this.certificates = [];
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching all certificates:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  previewSertifikat(certificate: any): void {
    // Navigate to the certificate view page
    this.router.navigate(['/sertifikat/view'], { queryParams: { id: certificate.id } });
  }

  downloadSertifikat(certificate: any): void {
    // Navigate to the certificate view page with a download trigger param
    this.router.navigate(['/sertifikat/view'], { queryParams: { id: certificate.id, downloadTrigger: true } });
  }

  getCertificateType(typeId: number): string {
    // Map typeId to a human-readable string
    switch (typeId) {
      case 1:
        return 'Sosialisasi';
      case 2:
        return 'Bimtek';
      // Add more cases as needed
      default:
        return 'Lainnya';
    }
  }

  formatDate(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) {
      return '';
    }
    const [year, month, day] = dateArray;
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  }

  formatTime(timeArray: number[]): string {
    if (!timeArray || timeArray.length < 3) {
      return '';
    }
    const [hour, minute, second] = timeArray;
    return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
  }
}