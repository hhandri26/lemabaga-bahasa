import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { Subject } from 'rxjs';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-survey-statistik-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  surveyId: string;
  surveyStatistics: any;
  surveySuggestions: any[] = [];
  surveyData: any; // Data survey detail berdasarkan feedbackId
  newComment: { [key: string]: string } = {};
  displayedColumns: string[] = ['isianAnswer', 'respondentName', 'respondentEmail', 'status', 'komentar'];
  statusOptions: string[] = ['Open', 'Resolved', 'Closed'];

  // Color palette yang konsisten dengan chart yang ditunjukkan
  private chartColors = [
    '#3B82F6', // Blue - untuk response positif
    '#10B981', // Green - untuk response sangat positif
    '#F59E0B', // Amber - untuk response netral
    '#F97316', // Orange - untuk response kurang positif
    '#EF4444', // Red - untuk response negatif
    '#8B5CF6', // Purple - untuk kategori tambahan
    '#06B6D4', // Cyan - untuk kategori tambahan
    '#84CC16', // Lime - untuk kategori tambahan
    '#EC4899', // Pink - untuk kategori tambahan
    '#6B7280'  // Gray - untuk kategori lainnya
  ];

  // Chart options dengan styling yang diperbaiki
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: 'inherit'
          },
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%';
            }
            return label;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3
      }
    }
  };

  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Persentase',
        backgroundColor: [],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBackgroundColor: [],
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _surveyKuisonerService: SurveyKuisonerService
  ) { }

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
      this.surveyId = params.get('id');
      if (this.surveyId) {
        console.log('Survey ID from route:', this.surveyId);
        this.loadSurveyStatistics();
        this.loadSurveySuggestions();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
  }

  // Method untuk memproses feedbackId dan mengambil survey ID
  // Diperbaiki dengan validasi yang lebih baik
  private extractSurveyIdFromFeedbackId(feedbackId: string): string {
    if (!feedbackId || typeof feedbackId !== 'string') {
      console.error('Invalid feedbackId:', feedbackId);
      return '';
    }
    
    console.log('Processing feedbackId:', feedbackId);
    
    // Trim whitespace dan validasi format
    const cleanFeedbackId = feedbackId.trim();
    if (!cleanFeedbackId) {
      console.error('FeedbackId kosong setelah trim');
      return '';
    }
    
    // Split berdasarkan strip dan ambil semua bagian kecuali 2 terakhir
    const parts = cleanFeedbackId.split('-');
    console.log('FeedbackId parts:', parts);
    
    if (parts.length >= 3) {
      // Menghilangkan 2 bagian terakhir untuk mendapatkan survey ID
      const extractedSurveyId = parts.slice(0, -2).join('-');
      console.log('Extracted survey ID:', extractedSurveyId);
      
      // Validasi hasil ekstraksi
      if (extractedSurveyId && extractedSurveyId.trim() !== '') {
        return extractedSurveyId;
      } else {
        console.error('Survey ID hasil ekstraksi kosong');
        return '';
      }
    }
    
    // Jika format tidak sesuai, coba gunakan feedbackId langsung
    console.warn('FeedbackId format tidak sesuai, mencoba menggunakan feedbackId langsung:', cleanFeedbackId);
    
    // Cek apakah feedbackId bisa digunakan langsung sebagai surveyId
    if (cleanFeedbackId.length > 0 && !cleanFeedbackId.includes('undefined')) {
      return cleanFeedbackId;
    }
    
    console.error('Tidak dapat memproses feedbackId:', feedbackId);
    return '';
  }

  // Method untuk load survey detail berdasarkan feedbackId
  loadSurveyDetail(feedbackId: string): void {
    if (!feedbackId) {
      console.error('FeedbackId tidak valid untuk load survey detail');
      return;
    }

    const surveyIdFromFeedback = this.extractSurveyIdFromFeedbackId(feedbackId);
    
    if (!surveyIdFromFeedback) {
      console.error('Tidak dapat mengekstrak survey ID dari feedbackId:', feedbackId);
      return;
    }

    console.log('Loading survey detail with extracted ID:', surveyIdFromFeedback);
    
    this._surveyKuisonerService.getById(surveyIdFromFeedback)
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
          console.error('Survey ID yang digunakan:', surveyIdFromFeedback);
          console.error('FeedbackId asal:', feedbackId);
          console.error('Error detail:', error.message);
          console.error('Error stack:', error.stack);
          
          // Reset surveyData jika terjadi error
          this.surveyData = null;
        }
      });
  }

  // Method untuk generate warna berdasarkan jumlah data
  private generateChartColors(dataLength: number): string[] {
    return Array.from({length: dataLength}, (_, i) => this.chartColors[i % this.chartColors.length]);
  }

  // Method untuk generate warna hover
  private generateHoverColors(colors: string[]): string[] {
    return colors.map(color => {
      // Menambahkan opacity untuk efek hover
      return color + 'CC'; // Menambahkan alpha transparency
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
          
          // Update chart data
          if (data.likechartPercentages) {
            this.pieChartData.labels = Object.keys(data.likechartPercentages);
            this.pieChartData.datasets[0].data = Object.values(data.likechartPercentages) as number[];
            
            // Generate colors based on data length
            const colors = this.generateChartColors(this.pieChartData.labels.length);
            this.pieChartData.datasets[0].backgroundColor = colors;
            this.pieChartData.datasets[0].hoverBackgroundColor = this.generateHoverColors(colors);
          }
        },
        error: (error) => {
          console.error('Error loading survey statistics:', error);
          console.error('Survey ID yang digunakan:', this.surveyId);
        }
      });
  }

  // Load survey suggestions menggunakan surveyId dari route
  loadSurveySuggestions(): void {
    console.log('Loading survey suggestions with surveyId:', this.surveyId);
    
    this._surveyKuisonerService.getSurveySuggestions(this.surveyId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          // Validasi response data
          if (data && typeof data === 'object') {
            this.surveySuggestions = data.suggestions || [];
            console.log('Fetched survey suggestions:', this.surveySuggestions);
            
            // Validasi array suggestions
            if (Array.isArray(this.surveySuggestions)) {
              // Initialize newComment with existing comments
              this.newComment = {};
              this.surveySuggestions.forEach(suggestion => {
                if (suggestion && suggestion.feedbackId) {
                  this.newComment[suggestion.feedbackId] = suggestion.komentar || '';
                } else {
                  console.warn('Invalid suggestion object:', suggestion);
                }
              });
              console.log('Initialized newComment:', this.newComment);

              // Load survey detail dari feedbackId pertama jika ada
              const firstValidSuggestion = this.surveySuggestions.find(s => s && s.feedbackId);
              if (firstValidSuggestion) {
                console.log('Loading survey detail from first feedback ID:', firstValidSuggestion.feedbackId);
                this.loadSurveyDetail(firstValidSuggestion.feedbackId);
              } else {
                console.warn('Tidak ada suggestion dengan feedbackId yang valid');
              }
            } else {
              console.error('Suggestions bukan array:', this.surveySuggestions);
              this.surveySuggestions = [];
            }
          } else {
            console.error('Response data tidak valid:', data);
            this.surveySuggestions = [];
          }
        },
        error: (error) => {
          console.error('Error loading survey suggestions:', error);
          console.error('Survey ID yang digunakan:', this.surveyId);
          console.error('Error detail:', error.message);
          
          // Reset data jika terjadi error
          this.surveySuggestions = [];
          this.newComment = {};
        }
      });
  }

  // Method untuk mengecek apakah status 'Closed' dapat dipilih
  canSelectClosed(feedbackId: string): boolean {
    const comment = this.newComment[feedbackId];
    return comment && comment.trim() !== '';
  }

  // Method untuk mendapatkan status options yang difilter
  getFilteredStatusOptions(feedbackId: string): string[] {
    if (this.canSelectClosed(feedbackId)) {
      return this.statusOptions;
    }
    return this.statusOptions.filter(status => status !== 'Closed');
  }

  // Method untuk handle perubahan komentar
  onCommentChange(feedbackId: string, comment: string): void {
    this.newComment[feedbackId] = comment && comment.trim() !== '' ? comment : '';
    
    // Jika komentar dikosongkan dan status saat ini 'Closed', ubah ke 'Resolved'
    const currentSuggestion = this.surveySuggestions.find(s => s.feedbackId === feedbackId);
    if (currentSuggestion && currentSuggestion.status === 'Closed' && !this.newComment[feedbackId]) {
      this.onStatusChange(feedbackId, 'Resolved');
    }
  }

  onStatusChange(feedbackId: string, newStatus: string): void {
    if (!feedbackId || !newStatus) {
      console.error('FeedbackId atau newStatus tidak valid:', { feedbackId, newStatus });
      return;
    }

    // Validasi surveySuggestions array
    if (!Array.isArray(this.surveySuggestions)) {
      console.error('surveySuggestions bukan array:', this.surveySuggestions);
      return;
    }

    const currentSuggestion = this.surveySuggestions.find(s => s && s.feedbackId === feedbackId);
    if (!currentSuggestion) {
      console.error('Suggestion tidak ditemukan untuk feedbackId:', feedbackId);
      console.error('Available suggestions:', this.surveySuggestions.map(s => s ? s.feedbackId : 'null'));
      return;
    }

    let finalStatus = newStatus;
    let finalComment = this.newComment[feedbackId] || '';

    // Prevent API call if status is not changing and comment is not being added/changed
    if (currentSuggestion.status === newStatus && currentSuggestion.komentar === finalComment) {
      console.log('Tidak ada perubahan, skip API call');
      return;
    }

    // Validasi untuk status 'Closed' - komentar wajib diisi
    if (newStatus === 'Closed' && !finalComment.trim()) {
      alert('Komentar wajib diisi jika status diubah menjadi Closed.');
      return; // Batalkan perubahan status
    }

    const updateData: any = { 
      feedbackId, 
      status: finalStatus,
      komentar: finalComment
    };

    console.log('Updating feedback status:', updateData);

    this._surveyKuisonerService.updateFeedbackStatus(updateData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          console.log('Update response:', response);
          
          if (response && response.success) {
            const index = this.surveySuggestions.findIndex(s => s && s.feedbackId === feedbackId);
            if (index !== -1) {
              this.surveySuggestions[index].status = finalStatus;
              this.surveySuggestions[index].komentar = finalComment;
              this.newComment[feedbackId] = finalComment;
              console.log('Status berhasil diupdate');
            } else {
              console.error('Index tidak ditemukan setelah update');
            }
          } else {
            console.error('Update gagal:', response);
          }
        },
        error: (error) => {
          console.error('Error updating feedback status:', error);
          console.error('Update data:', updateData);
          console.error('Error detail:', error.message);
        }
      });
  }

  // Method helper untuk mendapatkan data survey berdasarkan feedbackId tertentu
  getSurveyDataByFeedbackId(feedbackId: string): void {
    if (!feedbackId) {
      console.error('FeedbackId tidak valid');
      return;
    }
    console.log('Getting survey data for feedbackId:', feedbackId);
    this.loadSurveyDetail(feedbackId);
  }

  // Method untuk mendapatkan warna chart berdasarkan index
  getChartColorByIndex(index: number): string {
    if (this.chartColors && this.chartColors.length > 0) {
      return this.chartColors[index % this.chartColors.length];
    }
    // Fallback colors jika chartColors tidak tersedia
    const fallbackColors = ['#3B82F6', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6'];
    return fallbackColors[index % fallbackColors.length];
  }

  // Method untuk debugging - bisa dihapus setelah masalah resolved
  debugIds(): void {
    console.log('=== DEBUG INFO ===');
    console.log('Survey ID from route:', this.surveyId);
    console.log('Survey suggestions:', this.surveySuggestions);
    console.log('Survey data:', this.surveyData);
    console.log('New comments:', this.newComment);
    
    if (this.surveySuggestions.length > 0) {
      console.log('First feedbackId:', this.surveySuggestions[0].feedbackId);
      console.log('Extracted survey ID:', this.extractSurveyIdFromFeedbackId(this.surveySuggestions[0].feedbackId));
    }
  }
}