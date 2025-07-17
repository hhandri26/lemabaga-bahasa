import { Component, OnInit } from '@angular/core';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-survey-statistik-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  surveys$: Observable<any[]>;

  constructor(private _surveyKuisonerService: SurveyKuisonerService) { }

  ngOnInit(): void {
    this.surveys$ = this._surveyKuisonerService.items$;
    this._surveyKuisonerService.getListSurveiKuisoner().subscribe();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}