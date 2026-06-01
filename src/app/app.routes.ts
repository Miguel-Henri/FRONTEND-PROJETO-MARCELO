import { Routes } from '@angular/router';

import { UsuarioComponent } from './pages/usuario/usuario.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'usuario/cadastro',
    component: UsuarioComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      }

    ]
  }

];