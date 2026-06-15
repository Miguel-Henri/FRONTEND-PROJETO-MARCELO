import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransferenciaService } from '../../core/services/transferencia.service';
import { ToastService } from '../../shared/toast/toast.service';

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

  constructor(
    private fb: FormBuilder,
    private transferenciaService: TransferenciaService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      contaDestino: ['', [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
      valor: [null, [Validators.required, Validators.min(0.01), Validators.max(50000)]],
      descricao: ['', [Validators.maxLength(100)]]
    });
  }

  get camposFormulario() { return this.form.controls; }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.carregando.set(true);
    this.sucesso.set(false);

    this.transferenciaService.realizar(this.form.value).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.form.reset();
        this.toast.sucesso('Transferência realizada com sucesso!');
      },
      error: (err) => {
        this.carregando.set(false);
        // Mensagem específica por status; o interceptor global já exibe toast
        // para erros genéricos — aqui substituímos com mensagem contextual
        if (err.status === 404) {
          this.toast.erro('Conta de destino não encontrada.');
        } else if (err.status === 400 || err.status === 422) {
          this.toast.erro(err.error?.mensagem ?? 'Saldo insuficiente para realizar a transferência.');
        }
        // status 0 e 500 já são tratados pelo erroInterceptor
      }
    });
  }

  nova(): void {
    this.form.reset();
    this.sucesso.set(false);
  }
}
