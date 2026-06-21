import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  listarContasPendentes(): Observable<any> {
    // Retorna Page<ContaResumoDTO>; o componente usa .content
    return this.http.get<any>(`${this.apiUrl}/contas/pendentes`);
  }

  // O back usa PATCH /contas/acao com body JSON, não PATCH /contas/{id}/aprovar
  aprovarConta(contaId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/contas/acao`,
      { contaId, acao: 'APROVAR' },
      { responseType: 'text' }
    );
  }

  rejeitarConta(contaId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/contas/acao`,
      { contaId, acao: 'REJEITAR' },
      { responseType: 'text' }
    );
  }
}
