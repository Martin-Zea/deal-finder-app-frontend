import { Routes } from '@angular/router';
import { ComponentsPage } from './pages/components/components';

export const routes: Routes = [
    { path: '', redirectTo: 'components', pathMatch: 'full' },
    { path: 'components', component: ComponentsPage },
];
