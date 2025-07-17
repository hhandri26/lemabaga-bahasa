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
  newComment: { [key: string]: string } = {};
  displayedColumns: string[] = ['isianAnswer', 'respondentName', 'respondentEmail', 'status', 'komentar'];
  statusOptions: string[] = ['Open', 'Resolved', 'Closed'];

  // Chart options
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
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
        }
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
        backgroundColor: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
        borderColor: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
        hoverBackgroundColor: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
        hoverBorderColor: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
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
        this.loadSurveyStatistics();
        this.loadSurveySuggestions();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
  }

  loadSurveyStatistics(): void {
    this._surveyKuisonerService.getSurveyStatistics(this.surveyId).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
      this.surveyStatistics = data;
      this.pieChartData.labels = Object.keys(data.likechartPercentages);
      this.pieChartData.datasets[0].data = Object.values(data.likechartPercentages) as number[];
    });
  }

  loadSurveySuggestions(): void {
    this._surveyKuisonerService.getSurveySuggestions(this.surveyId).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
      this.surveySuggestions = data.suggestions;
      console.log('Fetched survey suggestions:', this.surveySuggestions);
      
      // Initialize newComment with existing comments - pastikan semua value ter-assign dengan benar
      this.newComment = {};
      this.surveySuggestions.forEach(suggestion => {
        this.newComment[suggestion.feedbackId] = suggestion.komentar || null;
      });
      console.log('Initialized newComment:', this.newComment);
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
    this.newComment[feedbackId] = comment && comment.trim() !== '' ? comment : null;
    
    // Jika komentar dikosongkan dan status saat ini 'Closed', ubah ke 'Resolved'
    const currentSuggestion = this.surveySuggestions.find(s => s.feedbackId === feedbackId);
    if (currentSuggestion && currentSuggestion.status === 'Closed' && !this.newComment[feedbackId]) {
      this.onStatusChange(feedbackId, 'Resolved');
    }
  }

  onStatusChange(feedbackId: string, newStatus: string): void {
    const currentSuggestion = this.surveySuggestions.find(s => s.feedbackId === feedbackId);
    if (!currentSuggestion) {
      return;
    }

    let finalStatus = newStatus;
    let finalComment = this.newComment[feedbackId];

    // Prevent API call if status is not changing and comment is not being added/changed
    if (currentSuggestion.status === newStatus && currentSuggestion.komentar === finalComment) {
      return;
    }

    // Validasi untuk status 'Closed' - komentar wajib diisi
    if (newStatus === 'Closed' && !finalComment) {
      alert('Komentar wajib diisi jika status diubah menjadi Closed.');
      return; // Batalkan perubahan status
    }

    const updateData: any = { feedbackId, status: finalStatus };
    // Always include comment if it exists, regardless of status
    updateData.komentar = finalComment;

    this._surveyKuisonerService.updateFeedbackStatus(updateData).pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      if (response.success) {
        const index = this.surveySuggestions.findIndex(s => s.feedbackId === feedbackId);
        if (index !== -1) {
          this.surveySuggestions[index].status = finalStatus;
          this.surveySuggestions[index].komentar = finalComment;
          this.newComment[feedbackId] = finalComment; // Update local comment input
        }
      }
    });
  }
}