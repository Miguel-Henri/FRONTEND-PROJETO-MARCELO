import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Investimento, InvestimentoService, ResumoInvestimentos } from '../../core/services/investimentos.service';
import { ToastService } from '../../shared/toast/toast.service';

type StatusInvestimentoView = 'ATIVO' | 'ENCERRADO' | 'VENCIDO' | 'RESGATADO';

interface InvestimentoView {
  id: number;
  tipo: string;
  descricao: string;
  valorAplicado: number;
  valorAtual: number;
  rendimento: number;
  percentualRendimento: number;
  dataAplicacao: string;
  vencimento?: string | null;
  status: StatusInvestimentoView;
}

@Component({
  selector: 'app-investimentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './investimento.html',
  styleUrl: './investimento.css'
})
export class InvestimentosComponent implements OnInit {
  form: FormGroup;

  investimentos = signal<InvestimentoView[]>([]);
  carregando = signal(false);
  carregandoAplicacao = signal(false);
  carregandoResgate = signal<number | null>(null);
  exibirFormulario = signal(false);

  tiposDisponiveis = [
    { valor: 'CDB',               rotulo: 'CDB',               descricao: 'Certificado de Depósito Bancário' },
    { valor: 'LCI',               rotulo: 'LCI',               descricao: 'Letra de Crédito Imobiliário' },
    { valor: 'LCA',               rotulo: 'LCA',               descricao: 'Letra de Crédito do Agronegócio' },
    { valor: 'TESOURO_SELIC',     rotulo: 'Tesouro Selic',     descricao: 'Renda Fixa - Baixo Risco' },
    { valor: 'TESOURO_PREFIXADO', rotulo: 'Tesouro Prefixado', descricao: 'Taxa Fixa Garantida' },
  ];

  resumo = computed<ResumoInvestimentos>(() => {
    const lista = this.investimentos().filter(i => i.status === 'ATIVO');
    const totalAplicado = lista.reduce((s, i) => s + i.valorAplicado, 0);
    const totalAtual    = lista.reduce((s, i) => s + i.valorAtual, 0);
    const rendimentoTotal  = totalAtual - totalAplicado;
    const percentualTotal  = totalAplicado > 0 ? (rendimentoTotal / totalAplicado) * 100 : 0;
    return { totalAplicado, totalAtual, rendimentoTotal, percentualTotal };
  });

  ativos     = computed(() => this.investimentos().filter(i => i.status === 'ATIVO'));
  encerrados = computed(() => this.investimentos().filter(i => i.status !== 'ATIVO'));

  constructor(
    private fb: FormBuilder,
    private investimentoService: InvestimentoService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      tipo:       ['CDB', Validators.required],
      valor:      [null, [Validators.required, Validators.min(100), Validators.max(500000)]],
      prazoMeses: [12,   [Validators.required, Validators.min(1),   Validators.max(360)]]
    });
  }

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.carregando.set(true);

    this.investimentoService.listar().subscribe({
      next: (lista: Investimento[]) => {
        this.investimentos.set(lista.map(inv => this.normalizarInvestimento(inv)));
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toast.erro('Erro ao carregar investimentos. Tente novamente.');
      }
    });
  }

  private normalizarInvestimento(investimento: Investimento): InvestimentoView {
    const inv = investimento as any;
    const tipo = inv.tipo ?? 'CDB';
    const valorAplicado = Number(inv.valorAplicado ?? inv.valorInvestido ?? inv.valor ?? 0);
    const valorAtual    = Number(inv.valorAtual ?? valorAplicado);
    const rendimento    = Number(inv.rendimento ?? valorAtual - valorAplicado);
    const percentualRendimento = Number(
      inv.percentualRendimento ?? (valorAplicado > 0 ? (rendimento / valorAplicado) * 100 : 0)
    );
    return {
      id: Number(inv.id), tipo,
      descricao: inv.descricao ?? this.labelTipo(tipo),
      valorAplicado, valorAtual, rendimento, percentualRendimento,
      dataAplicacao: inv.dataAplicacao ?? inv.dataCriacao ?? new Date().toISOString(),
      vencimento: inv.vencimento ?? null,
      status: inv.status ?? 'ATIVO'
    };
  }

  get camposFormulario() { return this.form.controls; }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  toggleFormulario(): void {
    this.exibirFormulario.update(v => !v);
    if (!this.exibirFormulario()) this.form.reset({ tipo: 'CDB', prazoMeses: 12 });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.carregandoAplicacao.set(true);

    this.investimentoService.aplicar({
      tipo: this.form.value.tipo,
      valor: this.form.value.valor,
      prazoMeses: this.form.value.prazoMeses
    } as any).subscribe({
      next: () => {
        this.carregandoAplicacao.set(false);
        this.toast.sucesso('Investimento aplicado com sucesso!');
        this.exibirFormulario.set(false);
        this.form.reset({ tipo: 'CDB', prazoMeses: 12 });
        this.carregar();
      },
      error: (err) => {
        this.carregandoAplicacao.set(false);
        if (err.status === 400 || err.status === 422) {
          this.toast.erro(err.error?.mensagem ?? 'Saldo insuficiente para realizar a aplicação.');
        }
      }
    });
  }

  resgatar(investimento: InvestimentoView): void {
    this.carregandoResgate.set(investimento.id);

    this.investimentoService.resgatar(investimento.id).subscribe({
      next: () => {
        this.carregandoResgate.set(null);
        this.toast.sucesso('Resgate realizado! O valor foi creditado na sua conta.');
        this.carregar();
      },
      error: (err) => {
        this.carregandoResgate.set(null);
        if (err.status === 422) {
          this.toast.erro('Este investimento não pode ser encerrado.');
        }
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPercentual(valor: number): string {
    return `${valor.toFixed(2).replace('.', ',')}%`;
  }

  formatarData(dataISO: string): string {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  }

  labelTipo(tipo: string): string {
    return this.tiposDisponiveis.find(t => t.valor === tipo)?.rotulo ?? tipo;
  }
}
