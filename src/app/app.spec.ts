import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { ApiWarmup } from './services/api-warmup';
import { vi } from 'vitest';

describe('App', () => {
  let warmupInit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    warmupInit = vi.fn();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: ApiWarmup, useValue: { init: warmupInit } },
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(warmupInit).toHaveBeenCalledOnce();
  });

  it('should render the home page in the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gerar orçamento');
  });
});
