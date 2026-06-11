import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PerfilUsuario } from '../models/usuario';

// Estrutura real retornada pelo back no login
export interface SessaoUsuario {
  usuarioId: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  fotoPerfil: string;
  contas: ContaSessao[];
  // perfil derivado da conta (CLIENTE | GERENTE)
  perfil: PerfilUsuario;
  // conta ativa (primeira conta ativa ou gerente)
  contaAtiva: ContaSessao;
}

export interface ContaSessao {
  contaId: number;
  numeroConta: number;
  agencia: number;
  tipo: 'CLIENTE' | 'GERENTE';
  status: string;
  saldo: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // O back usa /api/usuarios/login, não /api/auth/login
  private readonly apiUrl = 'http://localhost:8080/api/usuarios/login';

  sessao = signal<SessaoUsuario | null>(null);

  constructor(private http: HttpClient) {
    const salvo = localStorage.getItem('sessao');
    if (salvo) this.sessao.set(JSON.parse(salvo));
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, senha }).pipe(
      tap(resposta => {
        // Deriva o perfil a partir das contas retornadas
        const contas: ContaSessao[] = resposta.contas ?? [];
        const temGerente = contas.some((c: ContaSessao) => c.tipo === 'GERENTE');
        const perfil: PerfilUsuario = temGerente ? 'GERENTE' : 'CLIENTE';

        // Conta ativa: gerente ou a primeira ativa
        const contaAtiva =
          contas.find((c: ContaSessao) => c.tipo === 'GERENTE') ??
          contas.find((c: ContaSessao) => c.status === 'ATIVA') ??
          contas[0];

        const sessao: SessaoUsuario = {
          usuarioId: resposta.usuarioId,
          nome: resposta.nome,
          email: resposta.email,
          telefone: resposta.telefone,
          endereco: resposta.endereco,
          fotoPerfil: resposta.fotoPerfil,
          contas,
          perfil,
          contaAtiva
        };

        this.sessao.set(sessao);
        localStorage.setItem('sessao', JSON.stringify(sessao));
      })
    );
  }

  logout(): void {
    this.sessao.set(null);
    localStorage.removeItem('sessao');
  }

  get perfil(): PerfilUsuario | null {
    return this.sessao()?.perfil ?? null;
  }

  get isGerente(): boolean {
    return this.perfil === 'GERENTE';
  }

  get contaAtiva() {
    return this.sessao()?.contaAtiva ?? null;
  }

  get usuarioId(): number | null {
    return this.sessao()?.usuarioId ?? null;
  }
}
