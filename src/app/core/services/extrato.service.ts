import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ExtratoService {

  private readonly apiUrl = 'http://localhost:8080/api/extrato';

  constructor(private http: HttpClient) {}

  buscar(filtro: ExtratoFiltro): Observable<ExtratoResposta> {
    const params = new HttpParams()
      .set('dataInicio', filtro.dataInicio)
      .set('dataFim', filtro.dataFim)
      .set('pagina', filtro.pagina.toString())
      .set('itensPorPagina', filtro.itensPorPagina.toString());

    return this.http.get<ExtratoResposta>(this.apiUrl, { params });
  }
}
