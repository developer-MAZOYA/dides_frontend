import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  template: `
    <section class="container">
      <h1>Contact Us</h1>
      <p>We are happy to answer your questions about admissions, programmes and services.</p>

      <div class="contact-grid">
        <div class="card">
          <h2>Visit Us</h2>
          <p>
            Dodoma Institute of Development and Entrepreneurship Studies<br />
            P.O. Box 2032, Dodoma - Nzuguni
          </p>
        </div>

        <div class="card">
          <h2>Call Us</h2>
          <p>
            <strong>Admission Support:</strong>
            <a href="tel:+255679550047">+255 679 550 047</a>
          </p>
          <p>
            <strong>General Inquiries:</strong>
            <a href="tel:+255685506450">+255 685 506 450</a>
          </p>
        </div>

        <div class="card">
          <h2>Email Us</h2>
          <p><a href="mailto:info@dides.ac.tz">info@dides.ac.tz</a></p>
          <p><a href="mailto:didesvet@gmail.com">didesvet@gmail.com</a></p>
        </div>

        <div class="card">
          <h2>Working Hours</h2>
          <p>Monday to Friday<br />08:00 AM to 05:00 PM</p>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {}