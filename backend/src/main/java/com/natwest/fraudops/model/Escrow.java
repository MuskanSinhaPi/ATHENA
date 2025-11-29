package com.natwest.fraudops.model;

import java.util.ArrayList;
import java.util.List;

public class Escrow {
    private Double heldAmount;
    private Double releasedAmount;
    private List<EscrowEvent> holds;
    private List<String> disputes;

    public Escrow() {
        this.heldAmount = 0.0;
        this.releasedAmount = 0.0;
        this.holds = new ArrayList<>();
        this.disputes = new ArrayList<>();
    }

    public Double getHeldAmount() { return heldAmount; }
    public void setHeldAmount(Double heldAmount) { this.heldAmount = heldAmount; }

    public Double getReleasedAmount() { return releasedAmount; }
    public void setReleasedAmount(Double releasedAmount) { this.releasedAmount = releasedAmount; }

    public List<EscrowEvent> getHolds() { return holds; }
    public void setHolds(List<EscrowEvent> holds) { this.holds = holds; }

    public List<String> getDisputes() { return disputes; }
    public void setDisputes(List<String> disputes) { this.disputes = disputes; }
}
