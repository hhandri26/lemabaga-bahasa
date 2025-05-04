import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api/mock-api.service';
import { dokumens } from './data';

@Injectable({
    providedIn: 'root'
})
export class ReffDokumenMockApi {
    private _bobots: any = dokumens;

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    registerHandlers(): void {
        this._fuseMockApiService
            .onGet('api/apps/reff/dokumen')
            .reply(() => {
                const items = cloneDeep(this._bobots);
                return [200, items];
            });
    }
}
