import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-penerjemah',
  templateUrl: './penerjemah.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PenerjemahComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
