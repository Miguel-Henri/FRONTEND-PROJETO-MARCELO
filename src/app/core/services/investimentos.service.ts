import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONTA_ATIVA } from '../conta-ativa';

export interface Investimento {
  id: number;
  tipo: string;
  descricao: string;
  valorAplicado: number;
  valorAtual: number;
  rendimento: number;
  percentualRendimento: number;
  dataAplicacao: string;
  vencimento?: string;
  status: 'ATIVO' | 'VENCIDO' | 'RESGATADO';
}

export interface AplicarInvestimentoRequest {
  numeroConta: number;
  agencia: number;
  tipo: string;
  valor: number;
  prazoMeses: number;
}

export interface ResumoInvestimentos {
  totalAplicado: number;
  totalAtual: number;
  rendimentoTotal: number;
  percentualTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvestimentoService {

  private readonly apiUrl = 'http://localhost:8080/api/investimentos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Investimento[]> {
    return this.http.get<Investimento[]>(
      `${this.apiUrl}/${CONTA_ATIVA.agencia}/${CONTA_ATIVA.numeroConta}`
    );
  }

  aplicar(dados: Omit<AplicarInvestimentoRequest, 'numeroConta' | 'agencia'>): Observable<string> {
    return this.http.post(this.apiUrl, {
      numeroConta: CONTA_ATIVA.numeroConta,
      agencia: CONTA_ATIVA.agencia,
      ...dados
    }, { responseType: 'text' });
  }

  resgatar(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/resgatar`, {
      numeroConta: CONTA_ATIVA.numeroConta,
      agencia: CONTA_ATIVA.agencia
    }, { responseType: 'text' });
  }
}
