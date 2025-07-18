import { Route } from '@angular/router';
import { SurveyPublikComponent } from 'app/modules/survey-publik/survey-publik.component';
import { PublikStartResolver } from 'app/modules/survey-publik/survey-publik.resolvers';
import { PublikIsiComponent } from 'app/modules/survey-publik/isi/isi.component';

export const surveyPublikRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: ':id',
                component: SurveyPublikComponent,
            },
            {
                path: 'start/:hash',
                component: PublikIsiComponent,
                resolve: {
                    courses: PublikStartResolver
                }
            }
        ]
    }
];
