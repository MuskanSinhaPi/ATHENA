import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="brand-mark">NW</div>
        <div>
          <h1>NatWest Payment Gateway</h1>
          <p>Secure payments powered by FraudOps</p>
        </div>
      </header>

      <div class="content-wrapper">
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>

        <aside class="iframe-sidebar">
          <div class="iframe-container">
            <iframe
              id="reactIframe"
              src="http://localhost:5173"
              title="FraudOps Dashboard">
            </iframe>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: var(--nw-surface);
      padding: 16px 24px;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .app-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }

    .app-header p {
      margin: 0;
      font-size: 13px;
      color: var(--nw-muted);
    }

    .content-wrapper {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 500px;
      gap: 0;
      overflow: hidden;
    }

    .main-content {
      padding: 24px;
      overflow-y: auto;
      background: var(--nw-bg);
    }

    .iframe-sidebar {
      border-left: 1px solid #E5E7EB;
      background: white;
      overflow: hidden;
    }

    .iframe-container {
      height: 100%;
      width: 100%;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `]
})
export class AppComponent {
  title = 'fraudops-angular';
}
