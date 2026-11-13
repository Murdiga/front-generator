import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Budget } from './budget';
import { ApiWarmup } from './api-warmup';

describe('ApiWarmup', () => {
  it('should warm up on initialization and after 13 minutes when activity resumes', () => {
    const actuatorHealth = vi.fn(() => of({ status: 'UP' }));
    TestBed.configureTestingModule({
      providers: [{ provide: Budget, useValue: { actuatorHealth } }],
    });
    const service = TestBed.inject(ApiWarmup);
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000);

    try {
      service.init();
      expect(actuatorHealth).toHaveBeenCalledOnce();
      expect(service.isReady()).toBe(true);
      expect(service.isChecking()).toBe(false);

      now.mockReturnValue(1_000 + 13 * 60 * 1000 - 1);
      document.dispatchEvent(new Event('pointerdown'));
      expect(actuatorHealth).toHaveBeenCalledOnce();

      now.mockReturnValue(1_000 + 13 * 60 * 1000);
      document.dispatchEvent(new Event('pointerdown'));
      expect(actuatorHealth).toHaveBeenCalledTimes(2);
      expect(service.isReady()).toBe(true);
    } finally {
      now.mockRestore();
    }
  });

  it('should retry until the health endpoint reports UP', async () => {
    vi.useFakeTimers();
    const actuatorHealth = vi.fn()
      .mockReturnValueOnce(of({ status: 'STARTING' }))
      .mockReturnValueOnce(throwError(() => new Error('Request timed out')))
      .mockReturnValueOnce(of({ status: 'UP' }));
    TestBed.configureTestingModule({
      providers: [{ provide: Budget, useValue: { actuatorHealth } }],
    });
    const service = TestBed.inject(ApiWarmup);

    try {
      service.init();
      expect(service.isReady()).toBe(false);
      expect(service.isChecking()).toBe(true);

      await vi.advanceTimersByTimeAsync(10_000);

      expect(actuatorHealth).toHaveBeenCalledTimes(3);
      expect(service.isReady()).toBe(true);
      expect(service.isChecking()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
