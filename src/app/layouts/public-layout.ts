import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../components/top-bar/top-bar';
import { NavbarComponent } from '../components/navbar/navbar';
import { FooterComponent } from '../components/footer/footer';

/** Header, navigation and footer for the public DIDES website only. */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, TopBarComponent, NavbarComponent, FooterComponent],
  template: `
    <app-top-bar />
    <app-navbar />

    <main>
      <router-outlet />
    </main>

    <app-footer />
  `,
})
export class PublicLayoutComponent {}