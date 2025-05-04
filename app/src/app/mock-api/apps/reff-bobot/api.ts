import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api/mock-api.service';
import { bobots } from './data';

@Injectable({
    providedIn: 'root'
})
export class ReffBobotMockApi {
    private _bobots: any = bobots;

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    registerHandlers(): void {
        this._fuseMockApiService
            .onGet('api/apps/reff/bobot')
            .reply(() => {
                const items = cloneDeep(this._bobots);
                return [200, items];
            });
    }
}
