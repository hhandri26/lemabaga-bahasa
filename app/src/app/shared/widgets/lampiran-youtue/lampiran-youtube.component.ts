import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-widget-lampiran-youtube',
    templateUrl: './lampiran-youtube.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LampiranYoutubeComponent implements OnInit {
    @Input() item: any;

    constructor() { }

    ngOnInit(): void {
    }

}

