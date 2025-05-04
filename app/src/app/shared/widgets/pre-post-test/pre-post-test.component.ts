import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-widget-pre-post-test',
    templateUrl: './pre-post-test.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrePostTestComponent implements OnInit {
    @Input() item: any;

    constructor() { }

    ngOnInit(): void {
    }

}

