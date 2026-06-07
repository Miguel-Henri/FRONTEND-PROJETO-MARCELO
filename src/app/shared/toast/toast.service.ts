import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface Toast {
  id: number;
  mensagem: string;
  tipo: ToastTipo;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private contador = 0;
  toasts = signal<Toast[]>([]);

  private adicionar(mensagem: string, tipo: ToastTipo, duracao = 4000): void {
    const id = ++this.contador;
    this.toasts.update(lista => [...lista, { id, mensagem, tipo }]);
    setTimeout(() => this.remover(id), duracao);
  }

  sucesso(mensagem: string, duracao?: number): void {
    this.adicionar(mensagem, 'sucesso', duracao);
  }

  erro(mensagem: string, duracao?: number): void {
    this.adicionar(mensagem, 'erro', duracao ?? 6000);
  }

  aviso(mensagem: string, duracao?: number): void {
    this.adicionar(mensagem, 'aviso', duracao);
  }

  info(mensagem: string, duracao?: number): void {
    this.adicionar(mensagem, 'info', duracao);
  }

  remover(id: number): void {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }
}
