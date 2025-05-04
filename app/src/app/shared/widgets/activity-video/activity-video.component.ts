import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';


@Component({
    selector: 'app-widget-activity-video',
    templateUrl: './activity-video.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityVideoComponent implements OnInit {
    @Input() item: any;

    constructor() { }

    ngOnInit(): void {
    }

}

