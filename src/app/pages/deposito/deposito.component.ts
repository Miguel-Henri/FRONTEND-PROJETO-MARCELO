import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DepositoService } from '../../core/services/deposito.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './deposito.html',
  styleUrl: './deposito.css'
})
export class DepositoComponent {
  form: FormGroup;
  carregando = signal(false);
  sucesso = signal(false);

  constructor(
    private fb: FormBuilder,
    private depositoService: DepositoService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.01), Validators.max(50000)]]
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

    this.depositoService.realizar(this.form.value.valor).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.form.reset();
        this.toast.sucesso('Depósito realizado com sucesso!');
      },
      error: (err) => {
        this.carregando.set(false);
        if (err.status === 404) {
          this.toast.erro('Conta não encontrada.');
        }
        // demais erros tratados pelo erroInterceptor
      }
    });
  }

  novo(): void {
    this.form.reset();
    this.sucesso.set(false);
  }
}
