import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface TransferenciaPayload {
  contaDestino: number;
  valor: number;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class TransferenciaService {

  private readonly apiUrl = 'http://localhost:8080/api/contas/transferencia';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  realizar(payload: TransferenciaPayload): Observable<string> {
    const conta = this.auth.contaAtiva;
    return this.http.post(this.apiUrl, {
      agenciaOrigem: conta!.agencia,
      numeroContaOrigem: conta!.numeroConta,
      agenciaDestino: conta!.agencia,
      numeroContaDestino: Number(payload.contaDestino),
      valor: payload.valor,
      descricao: payload.descricao ?? null
    }, { responseType: 'text' });
  }
}
