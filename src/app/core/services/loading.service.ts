import { Injectable, signal } from '@angular/core';

/**
 * Serviço de loading global.
 * Exibe um indicador de progresso no topo da página (estilo NProgress)
 * durante requisições HTTP.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private contagem = 0;
  ativo = signal(false);

  iniciar(): void {
    this.contagem++;
    this.ativo.set(true);
  }

  finalizar(): void {
    this.contagem = Math.max(0, this.contagem - 1);
    if (this.contagem === 0) this.ativo.set(false);
  }
}
