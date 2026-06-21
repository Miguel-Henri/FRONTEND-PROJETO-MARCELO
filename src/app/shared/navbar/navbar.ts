import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  get nomeUsuario(): string {
    return this.auth.sessao()?.nome ?? 'Usuário';
  }

  get fotoUsuario(): string {
    const foto = this.auth.sessao()?.fotoPerfil;
    if (!foto) return 'avatar-default.svg';
    return foto.startsWith('http') ? foto : `http://localhost:8080/${foto}`;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
