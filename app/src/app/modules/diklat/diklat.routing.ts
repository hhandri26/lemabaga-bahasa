import { Route } from '@angular/router';
import { DiklatDetailsComponent } from './details/details.component';
import { DiklatComponent } from './diklat.component';
import { DiklatCourseResolver, DiklatCoursesResolver } from './diklat.resolvers';
import { DiklatKelolaComponent } from './kelola/kelola.component';
import { DiklatListComponent } from './list/list.component';

export const diklatRoutes: Route[] = [
    {
        path     : '',
        component: DiklatComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: DiklatListComponent,
                resolve  : {
                    courses: DiklatCoursesResolver
                }
            },
            {
                path     : 'kelola/:id',
                component: DiklatKelolaComponent,
                resolve  : {
                    course: DiklatCourseResolver
                }
            },
            {
                path     : 'play/:id',
                component: DiklatDetailsComponent,
                resolve  : {
                    course: DiklatCourseResolver
                }
            }
        ]
    }
];
