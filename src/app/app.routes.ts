import { Routes } from '@angular/router';
import { CadastroUsuarioComponent } from './pages/usuario/usuario.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransferenciaComponent } from './pages/transferencia/transferencia.component';
import { DepositoComponent } from './pages/deposito/deposito.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ExtratoComponent } from './pages/extrato/extrato.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { InvestimentosComponent } from './pages/investimento/investimento';
import { GerenteComponent } from './pages/gerente/gerente.component';
import { gerenteGuard } from './core/guards/gerente.guard';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'usuario/cadastro', component: CadastroUsuarioComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'transferencias', component: TransferenciaComponent },
      { path: 'deposito', component: DepositoComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'extrato', component: ExtratoComponent },
      { path: 'investimentos', component: InvestimentosComponent },
      {
        path: 'gerente',
        component: GerenteComponent,
        canActivate: [gerenteGuard]
      }
    ]
  }
];