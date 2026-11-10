import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function bootstrap(): Promise<void> {
  if (isDevMode()) {
    await import('@angular/compiler');
  }

  await bootstrapApplication(App, appConfig);
}

bootstrap().catch((err) => console.error(err));
