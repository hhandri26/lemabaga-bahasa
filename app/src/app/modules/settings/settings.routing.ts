import { Route } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { GetProfileResolver } from './settings.resolvers';

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent,
        resolve: {
            profile: GetProfileResolver
        },
    }
];
