import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONTA_ATIVA } from '../conta-ativa';

export interface TransferenciaPayload {
  contaDestino: number;
  valor: number;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {

  private readonly apiUrl = 'http://localhost:8080/api/contas/transferencia';

  constructor(private http: HttpClient) {}

  realizar(payload: TransferenciaPayload): Observable<string> {
    return this.http.post(this.apiUrl, {
      agenciaOrigem: CONTA_ATIVA.agencia,
      numeroContaOrigem: CONTA_ATIVA.numeroConta,
      agenciaDestino: CONTA_ATIVA.agencia,
      numeroContaDestino: Number(payload.contaDestino),
      valor: payload.valor,
      descricao: payload.descricao ?? null
    }, { responseType: 'text' });
  }
}
