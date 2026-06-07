import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CONTA_ATIVA } from '../conta-ativa';

export interface Lancamento {
  id: number;
  data: string;
  descricao: string;
  tipo: 'CREDITO' | 'DEBITO';
  valor: number;
}

export interface ExtratoResposta {
  lancamentos: Lancamento[];
  total: number;
}

export interface ExtratoFiltro {
  dataInicio: string;
  dataFim: string;
  pagina: number;
  itensPorPagina: number;
}

const TIPOS_CREDITO = new Set(['DEPOSITO', 'TRANSFERENCIA_RECEBIDA']);

@Injectable({
  providedIn: 'root'
})
export class ExtratoService {

  private readonly apiUrl = 'http://localhost:8080/api/contas/extrato';

  constructor(private http: HttpClient) {}

  buscar(filtro: ExtratoFiltro): Observable<ExtratoResposta> {
    const params = new HttpParams()
      .set('numeroConta', CONTA_ATIVA.numeroConta.toString())
      .set('agencia', CONTA_ATIVA.agencia.toString())
      .set('dataInicio', `${filtro.dataInicio}T00:00:00`)
      .set('dataFim', `${filtro.dataFim}T23:59:59`)
      .set('page', (filtro.pagina - 1).toString())
      .set('size', filtro.itensPorPagina.toString());

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(page => ({
        lancamentos: page.content.map((m: any) => ({
          id: m.id,
          data: m.dataTransacao,
          descricao: m.descricao ?? '',
          tipo: TIPOS_CREDITO.has(m.tipo) ? 'CREDITO' : 'DEBITO',
          valor: m.valor
        })),
        total: page.totalElements
      }))
    );
  }
}
