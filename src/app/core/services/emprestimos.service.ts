import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Parcela {
  id: number;
  numeroParcela: number;
  valorParcela: number;
  valorJuros: number;
  valorAmortizacao: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
}

export interface Emprestimo {
  id: number;
  valorEmprestimo: number;
  taxaJurosMensal: number;
  parcelas: number;
  status: 'SIMULADO' | 'SOLICITADO' | 'APROVADO' | 'REJEITADO' | 'EM_ANDAMENTO' | 'QUITADO';
  dataSolicitacao: string;
  dataAprovacao?: string;
  dataUltimoPagamento?: string;
  numeroConta: number;
  parcelasEmprestimo: Parcela[];
}

export interface SolicitarEmprestimoRequest {
  numeroConta: number;
  agencia: number;
  valorEmprestimo: number;
  parcelas: number;
}

@Injectable({ providedIn: 'root' })
export class EmprestimoService {

  private readonly apiUrl = 'http://localhost:8080/api/emprestimos';
  private readonly gerenteUrl = 'http://localhost:8080/api/gerente/emprestimos';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private get conta() {
    return this.auth.contaAtiva;
  }

  // GET /api/emprestimos/listar?numeroConta=X&agencia=Y
  listar(): Observable<Emprestimo[]> {
    const numeroConta = this.conta?.numeroConta;
    const agencia = this.conta?.agencia;
    return this.http.get<Emprestimo[]>(
      `${this.apiUrl}/listar`,
      { params: { numeroConta: numeroConta!.toString(), agencia: agencia!.toString() } }
    );
  }

  // POST /api/emprestimos/solicitar
  solicitar(dados: { valor: number; parcelas: number }): Observable<Emprestimo> {
    const payload: SolicitarEmprestimoRequest = {
      numeroConta: this.conta!.numeroConta,
      agencia: this.conta!.agencia,
      valorEmprestimo: dados.valor,
      parcelas: dados.parcelas
    };
    return this.http.post<Emprestimo>(`${this.apiUrl}/solicitar`, payload);
  }

  // POST /api/emprestimos/{id}/parcelas/{parcelaId}/pagar?numeroConta=X&agencia=Y
  pagarParcela(emprestimoId: number, parcelaId: number): Observable<Emprestimo> {
    const numeroConta = this.conta?.numeroConta;
    const agencia = this.conta?.agencia;
    return this.http.post<Emprestimo>(
      `${this.apiUrl}/${emprestimoId}/parcelas/${parcelaId}/pagar`,
      {},
      { params: { numeroConta: numeroConta!.toString(), agencia: agencia!.toString() } }
    );
  }

  // GET /api/gerente/emprestimos/pendentes
  listarPendentes(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(`${this.gerenteUrl}/pendentes`);
  }

  // POST /api/gerente/emprestimos/{id}/aprovar
  aprovar(id: number): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.gerenteUrl}/${id}/aprovar`, {});
  }

  // POST /api/gerente/emprestimos/{id}/rejeitar
  rejeitar(id: number): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.gerenteUrl}/${id}/rejeitar`, {});
  }
}
