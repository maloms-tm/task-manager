// Main entry point - starts up the Angular app

import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

// Start the app with our root component and enable Material animations
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Required for Angular Material animations
  ]
}).catch(err => console.error(err));

