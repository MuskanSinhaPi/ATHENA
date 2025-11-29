import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sandbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sandbox-container">
      <div class="card" style="max-width: 700px; margin: 0 auto; padding: 32px;">
        <div class="sandbox-banner" style="margin-bottom: 24px; text-align: center;">
          <div style="font-size: 16px; margin-bottom: 4px;">⚠️ Transaction Under Review</div>
          <div style="font-size: 13px; font-weight: 400;">
            This payment has been flagged by our fraud detection system
          </div>
        </div>

        <div *ngIf="transaction" style="margin-bottom: 24px;">
          <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">
            Processing Your Payment
          </h2>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
              <div style="font-size: 12px; color: var(--nw-muted); margin-bottom: 4px;">Customer</div>
              <div style="font-size: 15px; font-weight: 600;">{{ transaction.customer }}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--nw-muted); margin-bottom: 4px;">Amount</div>
              <div style="font-size: 15px; font-weight: 600; color: var(--nw-primary);">
                £{{ transaction.amount?.toFixed(2) }}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--nw-muted); margin-bottom: 4px;">Recipient</div>
              <div style="font-size: 15px;">{{ transaction.recipient }}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--nw-muted); margin-bottom: 4px;">Status</div>
              <div style="font-size: 15px; font-weight: 600; color: #D97706;">{{ transaction.status }}</div>
            </div>
          </div>

          <div style="padding: 16px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 6px; margin-bottom: 20px;">
            <div style="font-size: 12px; color: #92400E; margin-bottom: 6px; font-weight: 600;">
              Payment Message
            </div>
            <div style="font-size: 14px; color: #78350F;">{{ transaction.message }}</div>
          </div>

          <div style="padding: 20px; background: linear-gradient(135deg, rgba(103,44,142,0.05), rgba(217,79,161,0.05)); border-radius: 8px; text-align: center;">
            <div style="display: inline-block; width: 48px; height: 48px; border: 4px solid var(--nw-primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;"></div>
            <div style="font-size: 16px; font-weight: 600; color: var(--nw-primary); margin-bottom: 4px;">
              Under Security Review
            </div>
            <div style="font-size: 14px; color: var(--nw-muted);">
              Our fraud operations team is reviewing this transaction. You will be notified shortly.
            </div>
          </div>

          <div style="margin-top: 24px; padding: 16px; background: #EDE9FE; border-radius: 6px;">
            <div style="font-size: 13px; color: #5B21B6; font-weight: 600; margin-bottom: 8px;">
              Why was this flagged?
            </div>
            <div style="font-size: 13px; color: #6B21A8;">
              {{ transaction.reason }}
            </div>
          </div>

          <div style="margin-top: 16px; padding: 12px; background: #F3F4F6; border-radius: 6px; font-size: 12px; color: var(--nw-muted);">
            Transaction ID: {{ transaction.id }}
          </div>
        </div>

        <div *ngIf="!transaction" style="text-align: center; padding: 40px 0; color: var(--nw-muted);">
          Loading transaction details...
        </div>
      </div>
    </div>

    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `,
  styles: [`
    .sandbox-container {
      min-height: 100%;
    }
  `]
})
export class SandboxComponent implements OnInit, AfterViewInit {
  transactionId: string = '';
  transaction: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.params['id'];
    console.log('[Sandbox] Loading transaction:', this.transactionId);
    this.loadTransaction();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.transaction) {
        this.postToReactIframe();
      }
    }, 500);
  }

  loadTransaction() {
    this.http.get<any>(`http://localhost:8080/api/transactions/${this.transactionId}`)
      .subscribe({
        next: (txn) => {
          console.log('[Sandbox] Transaction loaded:', txn);
          this.transaction = txn;
          setTimeout(() => this.postToReactIframe(), 100);
        },
        error: (error) => {
          console.error('[Sandbox] Error loading transaction:', error);
        }
      });
  }

  postToReactIframe() {
    const iframe = document.getElementById('reactIframe') as HTMLIFrameElement;

    if (!iframe || !iframe.contentWindow) {
      console.warn('[Sandbox] React iframe not found, retrying...');
      setTimeout(() => this.postToReactIframe(), 1000);
      return;
    }

    const message = {
      type: 'NEW_FLAGGED_TXN',
      txn: this.transaction,
      meta: {
        source: 'angular_demo',
        timestamp: new Date().toISOString()
      }
    };

    console.log('[Sandbox] Posting to React iframe:', message);
    iframe.contentWindow.postMessage(message, '*');
  }
}
