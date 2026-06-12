package com.aifitx.progress;

import com.aifitx.common.BaseEntity;
import com.aifitx.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class BodyMeasurement extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate measuredOn;
    private double weightKg;
    private Double bodyFatPercent;
    private Double chestCm;
    private Double waistCm;
    private Double hipsCm;
    private Double armCm;
    private Double thighCm;
}
