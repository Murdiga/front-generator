import { inject, Service, signal } from '@angular/core';
import { catchError, defer, filter, finalize, of, repeat, take, timeout, timer } from 'rxjs';
import { Budget } from './budget';

@Service()
export class ApiWarmup {
  private readonly budget = inject(Budget);
  private readonly inactivityLimit = 13 * 60 * 1000;
  private readonly requestTimeout = 15 * 1000;
  private readonly retryDelay = 5 * 1000;
  private lastWarmup = 0;
  private initialized = false;
  readonly isReady = signal(false);
  readonly isChecking = signal(false);

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.warmup();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    ['pointerdown', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.refreshIfStale();
    }
  };

  private readonly handleActivity = (): void => {
    this.refreshIfStale();
  };

  refreshIfStale(): void {
    if (this.isChecking()) {
      return;
    }

    if (Date.now() - this.lastWarmup >= this.inactivityLimit) {
      this.warmup();
    }
  }

  private warmup(): void {
    if (this.isChecking()) {
      return;
    }

    this.isReady.set(false);
    this.isChecking.set(true);
    defer(() => this.budget.actuatorHealth()).pipe(
      timeout({ first: this.requestTimeout }),
      catchError(err => {
        console.warn('Health check falhou; tentando novamente.', err);
        return of(null);
      }),
      repeat({ delay: () => timer(this.retryDelay) }),
      filter(response => response?.status === 'UP'),
      take(1),
      finalize(() => this.isChecking.set(false)),
    ).subscribe({
      next: () => {
        this.lastWarmup = Date.now();
        this.isReady.set(true);
        console.info('API disponível');
      },
    });
  }
}
