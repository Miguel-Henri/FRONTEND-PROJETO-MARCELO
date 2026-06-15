import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Interceptor global de erros HTTP.
 *
 * Captura qualquer resposta de erro da API e exibe um toast automático,
 * a menos que o chamador passe o header X-Skip-Error-Toast: true.
 *
 * Erros tratados individualmente nos componentes devem usar esse header
 * para evitar mensagens duplicadas.
 */
export const erroInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  // Componentes que tratam o erro localmente podem pular o toast global
  const skipToast = req.headers.has('X-Skip-Error-Toast');
  const reqLimpo = skipToast
    ? req.clone({ headers: req.headers.delete('X-Skip-Error-Toast') })
    : req;

  return next(reqLimpo).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!skipToast) {
        const mensagem = resolverMensagem(err);
        toast.erro(mensagem);
      }
      return throwError(() => err);
    })
  );
};

function resolverMensagem(err: HttpErrorResponse): string {
  // Sem conexão com o servidor
  if (err.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  // Tenta usar a mensagem padronizada do GlobalExceptionHandler do back
  const body = err.error;
  if (body?.mensagem) return body.mensagem;
  if (typeof body === 'string' && body.length < 200) return body;

  // Fallback por status
  const fallbacks: Record<number, string> = {
    400: 'Requisição inválida.',
    401: 'Sessão expirada. Faça login novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito: este registro já existe.',
    422: 'Dados inválidos para esta operação.',
    500: 'Erro interno no servidor. Tente novamente mais tarde.',
  };

  return fallbacks[err.status] ?? `Erro inesperado (${err.status}).`;
}
