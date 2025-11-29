package com.natwest.fraudops.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Transaction {
    private String id;
    private String customer;
    private String phone;
    private String recipient;
    private Double amount;
    private String currency;
    private String method;
    private String message;
    private String reason;
    private String status;
    private boolean sandbox;
    private LocalDateTime createdAt;
    private String sessionId;
    private String deviceFingerprint;
    private String behavior;
    private Escrow escrow;
    private String llmExplanation;
    private String semanticContext;

    public Transaction() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.currency = "GBP";
        this.method = "bank_transfer";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isSandbox() { return sandbox; }
    public void setSandbox(boolean sandbox) { this.sandbox = sandbox; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }

    public String getBehavior() { return behavior; }
    public void setBehavior(String behavior) { this.behavior = behavior; }

    public Escrow getEscrow() { return escrow; }
    public void setEscrow(Escrow escrow) { this.escrow = escrow; }

    public String getLlmExplanation() { return llmExplanation; }
    public void setLlmExplanation(String llmExplanation) { this.llmExplanation = llmExplanation; }

    public String getSemanticContext() { return semanticContext; }
    public void setSemanticContext(String semanticContext) { this.semanticContext = semanticContext; }
}
