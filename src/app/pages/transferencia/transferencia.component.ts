import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransferenciaService } from '../../core/services/transferencia.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css'
})
export class TransferenciaComponent {
  form: FormGroup;
  carregando = signal(false);
  sucesso = signal(false);
  erro = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private transferenciaService: TransferenciaService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      contaDestino: ['', [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
      valor: [null, [Validators.required, Validators.min(0.01), Validators.max(50000)]],
      descricao: ['', [Validators.maxLength(100)]]
    });
  }

  get camposFormulario() {
    return this.form.controls;
  }

  campoInvalido(campo: string): boolean {
    const controle = this.form.get(campo);
    return !!(controle && controle.invalid && (controle.dirty || controle.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);
    this.sucesso.set(false);

    const valor = this.form.value.valor;
    this.transferenciaService.realizar(this.form.value).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.auth.atualizarSaldo(-valor);
        this.form.reset();
      },
      error: (err: { status: number }) => {
        this.carregando.set(false);
        if (err.status === 404) {
          this.erro.set('Conta de destino não encontrada.');
        } else if (err.status === 422) {
          this.erro.set('Saldo insuficiente para realizar a transferência.');
        } else if (err.status === 0) {
          this.erro.set('Não foi possível conectar ao servidor.');
        } else {
          this.erro.set('Erro ao realizar a transferência. Tente novamente.');
        }
      }
    });
  }

  nova(): void {
    this.form.reset();
    this.sucesso.set(false);
    this.erro.set(null);
  }
}
