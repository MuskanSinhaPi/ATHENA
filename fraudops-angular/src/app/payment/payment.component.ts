import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-container">
      <div class="card" style="max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Make a Payment</h2>
        <p style="margin: 0 0 32px 0; color: var(--nw-muted);">
          Enter payment details below. Suspicious payments will be flagged for review.
        </p>

        <form (ngSubmit)="submitPayment()" #paymentForm="ngForm">
          <div class="form-group">
            <label for="customer">Your Name</label>
            <input
              type="text"
              id="customer"
              name="customer"
              [(ngModel)]="payment.customer"
              required
              placeholder="John Doe">
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              [(ngModel)]="payment.phone"
              required
              placeholder="+44 7700 900000">
          </div>

          <div class="form-group">
            <label for="recipient">Recipient</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              [(ngModel)]="payment.recipient"
              required
              placeholder="Account name or business">
          </div>

          <div class="form-group">
            <label for="amount">Amount (GBP)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              [(ngModel)]="payment.amount"
              required
              min="0"
              step="0.01"
              placeholder="100.00">
          </div>

          <div class="form-group">
            <label for="message">Payment Message</label>
            <textarea
              id="message"
              name="message"
              [(ngModel)]="payment.message"
              rows="3"
              placeholder="Payment reference or note"></textarea>
            <small style="display: block; margin-top: 6px; color: var(--nw-muted);">
              Try keywords like "urgent", "otp", "click", or "refund" to trigger fraud detection
            </small>
          </div>

          <div *ngIf="successMessage" class="alert alert-success" style="margin-bottom: 20px; padding: 12px; background: #D1FAE5; border: 1px solid #A7F3D0; border-radius: 6px; color: #065F46;">
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="alert alert-error" style="margin-bottom: 20px; padding: 12px; background: #FEE2E2; border: 1px solid #FECACA; border-radius: 6px; color: #991B1B;">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="primary"
            style="width: 100%;"
            [disabled]="isProcessing || !paymentForm.valid">
            {{ isProcessing ? 'Processing...' : 'Submit Payment' }}
          </button>
        </form>

        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Test Scenarios</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="secondary" type="button" style="padding: 8px 12px; font-size: 13px;" (click)="loadSafeScenario()">
              Safe Payment
            </button>
            <button class="secondary" type="button" style="padding: 8px 12px; font-size: 13px;" (click)="loadFraudScenario()">
              Fraud Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      min-height: 100%;
    }
  `]
})
export class PaymentComponent {
  payment = {
    customer: '',
    phone: '',
    recipient: '',
    amount: 0,
    message: '',
    sessionId: this.generateSessionId(),
    deviceFingerprint: this.generateFingerprint(),
    behavior: 'normal'
  };

  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  generateFingerprint(): string {
    return 'fp_' + Math.random().toString(36).substring(2, 15);
  }

  loadSafeScenario() {
    this.payment = {
      customer: 'Sarah Johnson',
      phone: '+44 7700 900111',
      recipient: 'Local Coffee Shop',
      amount: 45.50,
      message: 'Weekly coffee supplies',
      sessionId: this.generateSessionId(),
      deviceFingerprint: this.generateFingerprint(),
      behavior: 'normal'
    };
    this.successMessage = '';
    this.errorMessage = '';
  }

  loadFraudScenario() {
    this.payment = {
      customer: 'Michael Brown',
      phone: '+44 7700 900222',
      recipient: 'Account Verification Services',
      amount: 1250,
      message: 'URGENT: Please send OTP code immediately for refund processing',
      sessionId: this.generateSessionId(),
      deviceFingerprint: this.generateFingerprint(),
      behavior: 'suspicious'
    };
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitPayment() {
    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post<any>('http://localhost:8080/api/payments/attempt', this.payment)
      .subscribe({
        next: (response) => {
          console.log('[Payment] Response:', response);

          if (response.flagged) {
            console.log('[Payment] Transaction flagged, navigating to sandbox:', response.txnId);
            this.router.navigate(['/sandbox', response.txnId]);
          } else {
            this.successMessage = `Payment successful! Transaction ID: ${response.txnId}`;
            this.isProcessing = false;
          }
        },
        error: (error) => {
          console.error('[Payment] Error:', error);
          this.errorMessage = 'Payment failed. Please try again.';
          this.isProcessing = false;
        }
      });
  }
}
