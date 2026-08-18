import { Routes } from '@angular/router';
import { ComponentsPage } from './pages/components/components';
import { CouponDetailPage } from './pages/coupon-detail/coupon-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'components', pathMatch: 'full' },
  { path: 'components', component: ComponentsPage },
  { path: 'cupon/:id', component: CouponDetailPage },
];
