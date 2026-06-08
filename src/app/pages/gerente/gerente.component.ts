import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GerenteService, ContaPendente } from '../../core/services/gerente.service';
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

  constructor(
    private gerenteService: GerenteService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.gerenteService.listarContasPendentes().subscribe({
      next: (contas: ContaPendente[]) => {
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
        this.contas.update((lista: ContaPendente[]) =>
          lista.filter((c: ContaPendente) => c.id !== id)
        );
      },
      error: () => this.toast.erro('Erro ao aprovar conta.')
    });
  }

  rejeitar(id: number): void {
    this.gerenteService.rejeitarConta(id).subscribe({
      next: () => {
        this.toast.aviso('Conta rejeitada.');
        this.contas.update((lista: ContaPendente[]) =>
          lista.filter((c: ContaPendente) => c.id !== id)
        );
      },
      error: () => this.toast.erro('Erro ao rejeitar conta.')
    });
  }
}
