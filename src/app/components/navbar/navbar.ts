import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);

  open = signal(false);     // mobile menu
  ictOpen = signal(false);  // ICT & Services dropdown

  toggleIct(event: Event) {
    // Stops this click from reaching the document listener below, so the menu stays open
    event.stopPropagation();
    this.ictOpen.update(v => !v);
  }

  closeAll() {
    this.open.set(false);
    this.ictOpen.set(false);
  }

  logout() {
    this.closeAll();
    this.auth.logout();
  }

  /** Clicking anywhere else closes the ICT dropdown. */
  @HostListener('document:click')
  onDocumentClick() {
    this.ictOpen.set(false);
  }
}