import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExtratoService, Lancamento } from '../../core/services/extrato.service';
@Component({
  selector: 'app-extrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './extrato.html',
  styleUrl: './extrato.css'
})
export class ExtratoComponent implements OnInit {
  form: FormGroup;

  lancamentos = signal<Lancamento[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);

  paginaAtual = signal(1);
  itensPorPagina = 10;
  totalItens = signal(0);

  totalPaginas = computed(() => Math.ceil(this.totalItens() / this.itensPorPagina));

  paginas = computed(() => {
    const total = this.totalPaginas();
    const atual = this.paginaAtual();
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (atual > 3) pages.push('...');
      for (let i = Math.max(2, atual - 1); i <= Math.min(total - 1, atual + 1); i++) pages.push(i);
      if (atual < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  constructor(
    private fb: FormBuilder,
    private extratoService: ExtratoService
  ) {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.form = this.fb.group({
      dataInicio: [this.formatarData(primeiroDia)],
      dataFim: [this.formatarData(hoje)]
    });
  }

  ngOnInit(): void {
    this.buscar();
  }

  private formatarData(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  buscar(pagina = 1): void {
    this.paginaAtual.set(pagina);
    this.carregando.set(true);
    this.erro.set(null);

    const { dataInicio, dataFim } = this.form.value;

    this.extratoService.buscar({ dataInicio, dataFim, pagina, itensPorPagina: this.itensPorPagina }).subscribe({
      next: (resp) => {
        this.lancamentos.set(resp.lancamentos);
        this.totalItens.set(resp.total);
        this.carregando.set(false);
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);
        if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao carregar o extrato. Tente novamente.');
        }
      }
    });
  }

  irParaPagina(pagina: number | '...'): void {
    if (pagina === '...' || pagina === this.paginaAtual()) return;
    this.buscar(pagina as number);
  }

  anterior(): void {
    if (this.paginaAtual() > 1) this.buscar(this.paginaAtual() - 1);
  }

  proximo(): void {
    if (this.paginaAtual() < this.totalPaginas()) this.buscar(this.paginaAtual() + 1);
  }

  onFiltrar(): void {
    this.buscar(1);
  }

  isEllipsis(p: number | '...'): boolean {
    return p === '...';
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarDataHora(dataISO: string): string {
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
