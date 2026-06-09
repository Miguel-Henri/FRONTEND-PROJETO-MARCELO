import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  private auth = inject(AuthService);

  // Saldo da conta ativa vindo da sessão (atualizado no login)
  saldo = computed(() => this.auth.contaAtiva?.saldo ?? 0);

  numeroConta = computed(() => this.auth.contaAtiva?.numeroConta ?? '—');
  agencia = computed(() => this.auth.contaAtiva?.agencia ?? '—');
  nomeUsuario = computed(() => this.auth.sessao()?.nome ?? '');
}
