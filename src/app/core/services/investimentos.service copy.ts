import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Campos reais retornados pelo back (Investimento.java)
export interface Investimento {
  id: number;
  tipoInvestimento: string;   // back usa tipoInvestimento, não tipo
  valorInvestido: number;     // back usa valorInvestido, não valorAplicado
  dataInicio: string;
  dataFim?: string;
  status: 'ATIVO' | 'ENCERRADO';
}

export interface AplicarInvestimentoRequest {
  numeroConta: number;
  agencia: number;
  tipoInvestimento: string;
  valorInvestido: number;
}

// Resumo calculado no front a partir da lista
export interface ResumoInvestimentos {
  totalAplicado: number;
  totalAtual: number;
  rendimentoTotal: number;
  percentualTotal: number;
}

@Injectable({ providedIn: 'root' })
export class InvestimentoService {

  private readonly apiUrl = 'http://localhost:8080/api/investimentos';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private get conta() {
    return this.auth.contaAtiva;
  }

  // GET /api/investimentos/listar?numeroConta=X&agencia=Y
  listar(): Observable<Investimento[]> {
    const numeroConta = this.conta?.numeroConta;
    const agencia = this.conta?.agencia;
    return this.http.get<Investimento[]>(
      `${this.apiUrl}/listar`,
      { params: { numeroConta: numeroConta!.toString(), agencia: agencia!.toString() } }
    );
  }

  // POST /api/investimentos/aplicar
  aplicar(dados: { tipo: string; valor: number }): Observable<Investimento> {
    const payload: AplicarInvestimentoRequest = {
      numeroConta: this.conta!.numeroConta,
      agencia: this.conta!.agencia,
      tipoInvestimento: dados.tipo,
      valorInvestido: dados.valor
    };
    return this.http.post<Investimento>(`${this.apiUrl}/aplicar`, payload);
  }

  // POST /api/investimentos/{id}/encerrar?numeroConta=X&agencia=Y
  resgatar(id: number): Observable<Investimento> {
    const numeroConta = this.conta?.numeroConta;
    const agencia = this.conta?.agencia;
    return this.http.post<Investimento>(
      `${this.apiUrl}/${id}/encerrar`,
      {},
      { params: { numeroConta: numeroConta!.toString(), agencia: agencia!.toString() } }
    );
  }
}
