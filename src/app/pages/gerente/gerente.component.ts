import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerenteService, ContaPendente } from '../../core/services/gerente.service';
import { Emprestimo, EmprestimoService } from '../../core/services/emprestimos.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gerente.html',
  styleUrl: './gerente.css'
})
export class GerenteComponent implements OnInit {

  contas = signal<ContaPendente[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);

  emprestimos = signal<Emprestimo[]>([]);
  carregandoEmprestimos = signal(false);

  constructor(
    private gerenteService: GerenteService,
    private emprestimoService: EmprestimoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregar();
    this.carregarEmprestimos();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.gerenteService.listarContasPendentes().subscribe({
      next: (page: any) => {
        // O back retorna Page<ContaResumoDTO>, pegar .content
        const contas: ContaPendente[] = (page.content ?? []).map((c: any) => ({
          id: c.id,
          nomeUsuario: c.nomeUsuario,
          emailUsuario: c.emailUsuario,
          dataCriacao: c.dataCriacao,
          status: c.status
        }));
        this.contas.set(contas);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar contas pendentes.');
        this.carregando.set(false);
      }
    });
  }

  aprovar(id: number): void {
    this.gerenteService.aprovarConta(id).subscribe({
      next: () => {
        this.toast.sucesso('Conta aprovada com sucesso!');
        this.contas.update(lista => lista.filter(c => c.id !== id));
      },
      error: () => this.toast.erro('Erro ao aprovar conta.')
    });
  }

  rejeitar(id: number): void {
    this.gerenteService.rejeitarConta(id).subscribe({
      next: () => {
        this.toast.aviso('Conta rejeitada.');
        this.contas.update(lista => lista.filter(c => c.id !== id));
      },
      error: () => this.toast.erro('Erro ao rejeitar conta.')
    });
  }

  carregarEmprestimos(): void {
    this.carregandoEmprestimos.set(true);
    this.emprestimoService.listarPendentes().subscribe({
      next: (lista: Emprestimo[]) => {
        this.emprestimos.set(lista);
        this.carregandoEmprestimos.set(false);
      },
      error: () => {
        this.toast.erro('Erro ao carregar empréstimos pendentes.');
        this.carregandoEmprestimos.set(false);
      }
    });
  }

  aprovarEmprestimo(id: number): void {
    this.emprestimoService.aprovar(id).subscribe({
      next: () => {
        this.toast.sucesso('Empréstimo aprovado com sucesso!');
        this.emprestimos.update(lista => lista.filter(e => e.id !== id));
      },
      error: () => this.toast.erro('Erro ao aprovar empréstimo.')
    });
  }

  rejeitarEmprestimo(id: number): void {
    this.emprestimoService.rejeitar(id).subscribe({
      next: () => {
        this.toast.aviso('Empréstimo rejeitado.');
        this.emprestimos.update(lista => lista.filter(e => e.id !== id));
      },
      error: () => this.toast.erro('Erro ao rejeitar empréstimo.')
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
