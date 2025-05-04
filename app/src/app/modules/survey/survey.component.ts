import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './survey.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
