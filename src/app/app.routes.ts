import { Routes } from '@angular/router';
import { ComponentsPage } from './pages/components/components';
import { CouponDetailPage } from './pages/coupon-detail/coupon-detail';
import { HomePage } from './pages/home/home';
import { MyCouponsPage } from './pages/my-coupons/my-coupons';
import { ProfilePage } from './pages/profile/profile';
import { Shell } from './pages/shell/shell';

export const routes: Routes = [
  // Las tres pestañas cuelgan del shell, que es quien dibuja la barra de abajo.
  // El detalle queda fuera a propósito: se entra y se vuelve, y ahí la barra
  // solo ofrecería escapes.
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: HomePage },
      { path: 'mis-cupones', component: MyCouponsPage },
      { path: 'perfil', component: ProfilePage },
    ],
  },
  { path: 'cupon/:id', component: CouponDetailPage },

  // El catálogo de componentes es una herramienta de desarrollo, no una
  // pantalla de la app: por eso vive fuera del shell y sin pestaña.
  { path: 'components', component: ComponentsPage },

  // Sin esto, una URL mal escrita renderiza una pantalla en blanco.
  { path: '**', redirectTo: '' },
];
