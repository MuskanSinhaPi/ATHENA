package com.natwest.fraudops.controller;

import com.natwest.fraudops.model.Escrow;
import com.natwest.fraudops.model.EscrowEvent;
import com.natwest.fraudops.model.Transaction;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final Map<String, Transaction> transactions = new ConcurrentHashMap<>();

    @PostMapping("/payments/attempt")
    public Map<String, Object> attemptPayment(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        boolean flagged = aiSimFlag(message);

        Transaction txn = new Transaction();
        txn.setCustomer((String) payload.getOrDefault("customer", "John Doe"));
        txn.setPhone((String) payload.getOrDefault("phone", "+44 7700 900000"));
        txn.setRecipient((String) payload.get("recipient"));
        txn.setAmount(((Number) payload.getOrDefault("amount", 0)).doubleValue());
        txn.setMessage(message);
        txn.setSessionId((String) payload.get("sessionId"));
        txn.setDeviceFingerprint((String) payload.get("deviceFingerprint"));
        txn.setBehavior((String) payload.get("behavior"));

        Map<String, Object> response = new HashMap<>();
        response.put("txnId", txn.getId());

        if (flagged) {
            txn.setStatus("FLAGGED");
            txn.setSandbox(true);
            txn.setReason("AI detected suspicious pattern in message");

            Escrow escrow = new Escrow();
            escrow.setHeldAmount(txn.getAmount());
            escrow.getHolds().add(new EscrowEvent("HOLD", txn.getAmount(), "Initial fraud flag"));
            txn.setEscrow(escrow);

            txn.setLlmExplanation("The payment message contains high-risk keywords commonly associated with social engineering attacks (OTP, urgent requests, refund scams). The transaction has been flagged for manual review.");
            txn.setSemanticContext("Payment urgency + credential request = high fraud probability");

            response.put("flagged", true);
            response.put("message", "Payment flagged for review");
        } else {
            txn.setStatus("APPROVED");
            txn.setSandbox(false);
            response.put("flagged", false);
            response.put("message", "Payment processed successfully");
        }

        transactions.put(txn.getId(), txn);
        return response;
    }

    @GetMapping("/transactions/flagged")
    public List<Transaction> getFlaggedTransactions() {
        return transactions.values().stream()
                .filter(t -> "FLAGGED".equals(t.getStatus()))
                .toList();
    }

    @GetMapping("/transactions/{id}")
    public Transaction getTransaction(@PathVariable String id) {
        return transactions.get(id);
    }

    @PostMapping("/transactions/{id}/action")
    public Map<String, Object> performAction(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {

        Transaction txn = transactions.get(id);
        if (txn == null) {
            return Map.of("ok", false, "error", "Transaction not found");
        }

        String action = (String) payload.get("action");
        String details = (String) payload.getOrDefault("details", "");

        switch (action) {
            case "APPROVE":
                txn.setStatus("APPROVED");
                if (txn.getEscrow() != null) {
                    double held = txn.getEscrow().getHeldAmount();
                    txn.getEscrow().setHeldAmount(0.0);
                    txn.getEscrow().setReleasedAmount(held);
                    txn.getEscrow().getHolds().add(new EscrowEvent("RELEASE", held, "Approved by operator"));
                }
                break;

            case "REJECT":
                txn.setStatus("REJECTED");
                if (txn.getEscrow() != null) {
                    txn.getEscrow().setHeldAmount(0.0);
                    txn.getEscrow().getHolds().add(new EscrowEvent("REJECT", txn.getAmount(), details));
                }
                break;

            case "ESCALATE":
                txn.setStatus("ESCALATED");
                break;

            case "CALL_CUSTOMER":
                txn.setStatus("CALLING");
                break;

            case "HOLD_ESCROW":
                if (txn.getEscrow() != null) {
                    txn.getEscrow().getHolds().add(new EscrowEvent("HOLD", txn.getAmount(), details));
                }
                break;

            case "RELEASE_ESCROW":
                if (txn.getEscrow() != null) {
                    double held = txn.getEscrow().getHeldAmount();
                    txn.getEscrow().setHeldAmount(0.0);
                    txn.getEscrow().setReleasedAmount(held);
                    txn.getEscrow().getHolds().add(new EscrowEvent("RELEASE", held, details));
                }
                txn.setStatus("RELEASED");
                break;

            case "PARTIAL_REFUND":
                if (txn.getEscrow() != null) {
                    Double refundAmount = payload.get("refundAmount") != null
                        ? ((Number) payload.get("refundAmount")).doubleValue()
                        : txn.getAmount() * 0.5;
                    txn.getEscrow().getHolds().add(new EscrowEvent("PARTIAL_REFUND", refundAmount, details));
                }
                break;

            case "RAISE_DISPUTE":
                if (txn.getEscrow() != null) {
                    txn.getEscrow().getDisputes().add(details);
                }
                txn.setStatus("DISPUTED");
                break;
        }

        return Map.of("ok", true, "txn", txn);
    }

    private boolean aiSimFlag(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase();
        return lower.contains("otp") || lower.contains("urgent") ||
               lower.contains("refund") || lower.contains("click");
    }
}
