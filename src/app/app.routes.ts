import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CadastroUsuarioComponent } from './pages/usuario/usuario';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'usuario/cadastro',
        component: CadastroUsuarioComponent
    },
];
