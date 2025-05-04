import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './forum.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForumComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
