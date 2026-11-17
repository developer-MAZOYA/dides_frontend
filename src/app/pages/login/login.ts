import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { homePathFor } from '../../services/session.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="login">
      <div class="login-card">
        <img src="dides.png" alt="DIDES logo" class="logo" />
        <h1>Sign in</h1>
        <p class="sub">Students, staff and directors sign in to reach their dashboard.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" autocomplete="username" />
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" autocomplete="current-password" />
          </label>

          @if (error()) {
            <div class="alert" role="alert">{{ error() }}</div>
          }

          <button class="btn btn-primary full" type="submit" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="foot">New applicant? <a routerLink="/portal">Apply for admission</a></p>
      </div>
    </section>
  `,
  styles: [`
    .login {
      min-height: 80vh;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 20px;
      padding: 2.2rem 2rem;
      box-shadow: var(--shadow-md);
      border-top: 5px solid var(--gold);
      text-align: center;
    }

    .logo {
      width: 70px;
      height: 70px;
      object-fit: contain;
      margin-bottom: 0.8rem;
    }

    h1 { margin: 0 0 0.3rem; font-size: 1.6rem; }

    .sub {
      color: var(--muted);
      margin: 0 0 1.5rem;
      font-size: 0.95rem;
    }

    form {
      display: grid;
      gap: 1rem;
      text-align: left;
    }

    .field {
      display: grid;
      gap: 0.35rem;

      span {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--navy);
      }

      input {
        font: inherit;
        padding: 0.75rem 0.9rem;
        border: 1px solid #c7dbe8;
        border-radius: 10px;
        background: #fbfeff;

        &:focus {
          outline: none;
          border-color: var(--deep);
          box-shadow: 0 0 0 3px rgba(42, 111, 158, 0.15);
        }
      }
    }

    .alert {
      background: #fdecec;
      color: #9b1c1c;
      border: 1px solid #f5b5b5;
      padding: 0.7rem 0.9rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
    }
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, var(--sky) 0%, var(--pale) 60%, var(--light) 100%);
}
    .full {
      width: 100%;
      justify-content: center;
    }

    .foot {
      margin: 1.4rem 0 0;
      font-size: 0.9rem;
      color: var(--muted);

      a {
        color: var(--purple);
        font-weight: 700;
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder).nonNullable;
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(email, password).subscribe({
      next: session => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target =
          returnUrl && returnUrl.startsWith('/dashboard') ? returnUrl : homePathFor(session.role);
        this.router.navigateByUrl(target);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Cannot reach the server. Check that the backend is running.');
        } else if (err.status === 401 || err.status === 403) {
          this.error.set('Invalid email or password.');
        } else {
          this.error.set('Sign-in failed. Please try again.');
        }
      },
    });
  }
}