import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContaPendente {
  id: number;
  nomeUsuario: string;
  email: string;
  dataSolicitacao: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
}

@Injectable({ providedIn: 'root' })
export class GerenteService {

  private readonly apiUrl = 'http://localhost:8080/api/gerente';

  constructor(private http: HttpClient) {}

  listarContasPendentes(): Observable<ContaPendente[]> {
    return this.http.get<ContaPendente[]>(`${this.apiUrl}/contas/pendentes`);
  }

  aprovarConta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/contas/${id}/aprovar`, {});
  }

  rejeitarConta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/contas/${id}/rejeitar`, {});
  }
}