import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Emprestimo, Parcela, EmprestimoService } from '../../core/services/emprestimos.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-emprestimos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './emprestimo.html',
  styleUrl: './emprestimo.css'
})
export class EmprestimosComponent implements OnInit {
  form: FormGroup;

  emprestimos = signal<Emprestimo[]>([]);
  carregando = signal(false);
  carregandoSolicitacao = signal(false);
  carregandoPagamento = signal<number | null>(null);
  erro = signal<string | null>(null);
  erroSolicitacao = signal<string | null>(null);
  sucesso = signal<string | null>(null);
  exibirFormulario = signal(false);

  ativos = computed(() =>
    this.emprestimos().filter(e => e.status === 'SOLICITADO' || e.status === 'EM_ANDAMENTO')
  );

  encerrados = computed(() =>
    this.emprestimos().filter(e => e.status === 'QUITADO' || e.status === 'REJEITADO')
  );

  constructor(
    private fb: FormBuilder,
    private emprestimoService: EmprestimoService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      valor: [null, [Validators.required, Validators.min(100), Validators.max(500000)]],
      parcelas: [12, [Validators.required, Validators.min(1), Validators.max(360)]]
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.emprestimoService.listar().subscribe({
      next: (lista: Emprestimo[]) => {
        this.emprestimos.set(lista);
        this.carregando.set(false);
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);

        if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao carregar empréstimos. Tente novamente.');
        }
      }
    });
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
    this.erroSolicitacao.set(null);
    this.sucesso.set(null);

    if (!this.exibirFormulario()) {
      this.form.reset({ parcelas: 12 });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregandoSolicitacao.set(true);
    this.erroSolicitacao.set(null);
    this.sucesso.set(null);

    this.emprestimoService.solicitar({
      valor: this.form.value.valor,
      parcelas: this.form.value.parcelas
    }).subscribe({
      next: () => {
        this.carregandoSolicitacao.set(false);
        this.sucesso.set('Empréstimo solicitado! Aguarde a aprovação do gerente.');
        this.exibirFormulario.set(false);
        this.form.reset({ parcelas: 12 });
        this.carregar();
      },
      error: (err: { status: number }) => {
        this.carregandoSolicitacao.set(false);

        if (err.status === 422) {
          this.erroSolicitacao.set('Não foi possível solicitar o empréstimo. Verifique os dados.');
        } else if (err.status === 0) {
          this.erroSolicitacao.set('Não foi possível conectar ao servidor.');
        } else {
          this.erroSolicitacao.set('Erro ao solicitar empréstimo. Tente novamente.');
        }
      }
    });
  }

  pagarParcela(emprestimo: Emprestimo, parcela: Parcela): void {
    this.carregandoPagamento.set(parcela.id);
    this.sucesso.set(null);
    this.erro.set(null);

    this.emprestimoService.pagarParcela(emprestimo.id, parcela.id).subscribe({
      next: () => {
        this.carregandoPagamento.set(null);
        this.sucesso.set('Parcela paga com sucesso!');
        this.auth.atualizarSaldo(-parcela.valorParcela);
        this.carregar();
      },
      error: (err: { status: number }) => {
        this.carregandoPagamento.set(null);

        if (err.status === 422) {
          this.erro.set('Saldo insuficiente para pagar a parcela.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao pagar a parcela. Tente novamente.');
        }
      }
    });
  }

  parcelasPagas(emprestimo: Emprestimo): number {
    return emprestimo.parcelasEmprestimo.filter(p => p.status === 'PAGO').length;
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatarData(dataISO: string): string {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  }

  rotuloStatus(status: string): string {
    const rotulos: { [chave: string]: string } = {
      SIMULADO: 'Simulado',
      SOLICITADO: 'Aguardando aprovação',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado',
      EM_ANDAMENTO: 'Em andamento',
      QUITADO: 'Quitado'
    };
    return rotulos[status] ?? status;
  }
}
