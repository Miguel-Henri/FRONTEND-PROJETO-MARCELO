import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ContaPendente {
  id: number;           // id da conta (não do usuário)
  nomeUsuario: string;
  emailUsuario: string;
  dataCriacao: string;  // campo real no ContaResumoDTO
  status: 'PENDENTE' | 'ATIVA' | 'BLOQUEADA';
}

@Injectable({ providedIn: 'root' })
export class GerenteService {

  private readonly apiUrl = 'http://localhost:8080/api/gerente';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // O back exige o header X-Gerente-Conta-Id com o ID da conta do gerente
  private headers(): HttpHeaders {
    const contaId = this.auth.contaAtiva?.contaId ?? 0;
    return new HttpHeaders({ 'X-Gerente-Conta-Id': contaId.toString() });
  }

  listarContasPendentes(): Observable<any> {
    // Retorna Page<ContaResumoDTO>; o componente usa .content
    return this.http.get<any>(
      `${this.apiUrl}/contas/pendentes`,
      { headers: this.headers() }
    );
  }

  // O back usa PATCH /contas/acao com body JSON, não PATCH /contas/{id}/aprovar
  aprovarConta(contaId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/contas/acao`,
      {
        contaId,
        gerenteContaId: this.auth.contaAtiva?.contaId,
        acao: 'APROVAR'
      },
      { responseType: 'text' }
    );
  }

  rejeitarConta(contaId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/contas/acao`,
      {
        contaId,
        gerenteContaId: this.auth.contaAtiva?.contaId,
        acao: 'REJEITAR'
      },
      { responseType: 'text' }
    );
  }
}
