import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario, PerfilUsuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080/api/auth';

  usuarioLogado = signal<Usuario | null>(null);

  constructor(private http: HttpClient) {
    // Hidratar do localStorage ao iniciar
    const salvo = localStorage.getItem('usuario');
    if (salvo) this.usuarioLogado.set(JSON.parse(salvo));
  }

  login(email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(usuario => {
        this.usuarioLogado.set(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }

  logout(): void {
    this.usuarioLogado.set(null);
    localStorage.removeItem('usuario');
  }

  get perfil(): PerfilUsuario | null {
    return this.usuarioLogado()?.perfil ?? null;
  }

  get isGerente(): boolean {
    return this.perfil === 'GERENTE';
  }
}