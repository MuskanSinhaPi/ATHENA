import { Routes } from '@angular/router';
import { PaymentComponent } from './payment/payment.component';
import { SandboxComponent } from './sandbox/sandbox.component';

export const routes: Routes = [
  { path: '', component: PaymentComponent },
  { path: 'sandbox/:id', component: SandboxComponent },
  { path: '**', redirectTo: '' }
];
