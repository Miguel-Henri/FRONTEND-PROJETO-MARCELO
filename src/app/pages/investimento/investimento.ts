import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Investimento, InvestimentoService, ResumoInvestimentos } from '../../core/services/investimentos.service';
import { AuthService } from '../../core/services/auth.service';

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
  erro = signal<string | null>(null);
  erroAplicacao = signal<string | null>(null);
  sucesso = signal<string | null>(null);
  exibirFormulario = signal(false);

  tiposDisponiveis = [
    { valor: 'CDB', rotulo: 'CDB', descricao: 'Certificado de Depósito Bancário' },
    { valor: 'LCI', rotulo: 'LCI', descricao: 'Letra de Crédito Imobiliário' },
    { valor: 'LCA', rotulo: 'LCA', descricao: 'Letra de Crédito do Agronegócio' },
    { valor: 'TESOURO_SELIC', rotulo: 'Tesouro Selic', descricao: 'Renda Fixa - Baixo Risco' },
    { valor: 'TESOURO_PREFIXADO', rotulo: 'Tesouro Prefixado', descricao: 'Taxa Fixa Garantida' },
  ];

  resumo = computed<ResumoInvestimentos>(() => {
    const lista = this.investimentos().filter(i => i.status === 'ATIVO');

    const totalAplicado = lista.reduce((s, i) => s + i.valorAplicado, 0);
    const totalAtual = lista.reduce((s, i) => s + i.valorAtual, 0);
    const rendimentoTotal = totalAtual - totalAplicado;
    const percentualTotal = totalAplicado > 0 ? (rendimentoTotal / totalAplicado) * 100 : 0;

    return {
      totalAplicado,
      totalAtual,
      rendimentoTotal,
      percentualTotal
    };
  });

  ativos = computed(() => this.investimentos().filter(i => i.status === 'ATIVO'));

  encerrados = computed(() =>
    this.investimentos().filter(i => i.status !== 'ATIVO')
  );

  constructor(
    private fb: FormBuilder,
    private investimentoService: InvestimentoService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      tipo: ['CDB', Validators.required],
      valor: [null, [Validators.required, Validators.min(100), Validators.max(500000)]],
      prazoMeses: [12, [Validators.required, Validators.min(1), Validators.max(360)]]
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.investimentoService.listar().subscribe({
      next: (lista: Investimento[]) => {
        this.investimentos.set(lista.map(inv => this.normalizarInvestimento(inv)));
        this.carregando.set(false);
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);

        if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao carregar investimentos. Tente novamente.');
        }
      }
    });
  }

  private normalizarInvestimento(investimento: Investimento): InvestimentoView {
    const valorAplicado = investimento.valorInvestido;
    const valorAtual = investimento.valorAtual;
    const rendimento = investimento.rendimento;
    const percentualRendimento = valorAplicado > 0 ? (rendimento / valorAplicado) * 100 : 0;

    return {
      id: investimento.id,
      tipo: investimento.tipoInvestimento,
      descricao: this.labelTipo(investimento.tipoInvestimento),
      valorAplicado,
      valorAtual,
      rendimento,
      percentualRendimento,
      dataAplicacao: investimento.dataInicio,
      vencimento: investimento.dataFim ?? null,
      status: investimento.status === 'ENCERRADO' ? 'RESGATADO' : 'ATIVO'
    };
  }

  get camposFormulario() {
    return this.form.controls;
  }

  campoInvalido(campo: string): boolean {
    const controle = this.form.get(campo);
    return !!(controle && controle.invalid && (controle.dirty || controle.touched));
  }

  toggleFormulario(): void {
    this.exibirFormulario.update(v => !v);
    this.erroAplicacao.set(null);
    this.sucesso.set(null);

    if (!this.exibirFormulario()) {
      this.form.reset({ tipo: 'CDB', prazoMeses: 12 });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregandoAplicacao.set(true);
    this.erroAplicacao.set(null);
    this.sucesso.set(null);

    const valor = this.form.value.valor;
    this.investimentoService.aplicar({
      tipo: this.form.value.tipo,
      valor
    }).subscribe({
      next: () => {
        this.carregandoAplicacao.set(false);
        this.sucesso.set('Investimento aplicado com sucesso!');
        this.exibirFormulario.set(false);
        this.auth.atualizarSaldo(-valor);
        this.form.reset({ tipo: 'CDB', prazoMeses: 12 });
        this.carregar();
      },
      error: (err: { status: number }) => {
        this.carregandoAplicacao.set(false);

        if (err.status === 422) {
          this.erroAplicacao.set('Saldo insuficiente para realizar a aplicação.');
        } else if (err.status === 0) {
          this.erroAplicacao.set('Não foi possível conectar ao servidor.');
        } else {
          this.erroAplicacao.set('Erro ao aplicar investimento. Tente novamente.');
        }
      }
    });
  }

  resgatar(investimento: InvestimentoView): void {
    this.carregandoResgate.set(investimento.id);
    this.sucesso.set(null);
    this.erro.set(null);

    this.investimentoService.resgatar(investimento.id).subscribe({
      next: (resgatado: Investimento) => {
        this.carregandoResgate.set(null);
        this.sucesso.set('Resgate realizado com sucesso! O valor foi creditado na sua conta.');
        this.auth.atualizarSaldo(resgatado.valorAtual);
        this.carregar();
      },
      error: (err: { status: number }) => {
        this.carregandoResgate.set(null);

        if (err.status === 422) {
          this.erro.set('Este investimento não pode ser encerrado.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao realizar o resgate. Tente novamente.');
        }
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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