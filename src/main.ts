import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import posthog from 'posthog-js'
import { environment } from './environments/environment';

posthog.init(
  environment.POSTHOG_KEY,
  {
    api_host:environment.POSTHOG_HOST,
    person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
  }
)

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
