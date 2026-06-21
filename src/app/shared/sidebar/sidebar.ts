import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SePerfilDirective } from '../directives/se-perfil.directive';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SePerfilDirective],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
