import { inject, Service } from '@angular/core';
import { Budget } from './budget';

@Service()
export class ApiWarmup {
  private readonly budget = inject(Budget);
  private readonly inactivityLimit = 13 * 60 * 1000;
  private lastWarmup = 0;
  private initialized = false;

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
      this.checkActivity();
    }
  };

  private readonly handleActivity = (): void => {
    this.checkActivity();
  };

  private checkActivity(): void {
    if (Date.now() - this.lastWarmup >= this.inactivityLimit) {
      this.warmup();
    }
  }

  private warmup(): void {
    this.lastWarmup = Date.now();
    this.budget.actuatorHealth().subscribe({
      next: () => console.info('API disponível'),
      error: err => console.error('Warm-up não concluído', err),
    });
  }
}
