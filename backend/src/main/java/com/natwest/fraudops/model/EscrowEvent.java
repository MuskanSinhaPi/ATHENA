package com.natwest.fraudops.model;

import java.time.LocalDateTime;

public class EscrowEvent {
    private String action;
    private Double amount;
    private LocalDateTime timestamp;
    private String reason;

    public EscrowEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public EscrowEvent(String action, Double amount, String reason) {
        this();
        this.action = action;
        this.amount = amount;
        this.reason = reason;
    }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
