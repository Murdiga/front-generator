import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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

      now.mockReturnValue(1_000 + 13 * 60 * 1000 - 1);
      document.dispatchEvent(new Event('pointerdown'));
      expect(actuatorHealth).toHaveBeenCalledOnce();

      now.mockReturnValue(1_000 + 13 * 60 * 1000);
      document.dispatchEvent(new Event('pointerdown'));
      expect(actuatorHealth).toHaveBeenCalledTimes(2);
    } finally {
      now.mockRestore();
    }
  });
});
