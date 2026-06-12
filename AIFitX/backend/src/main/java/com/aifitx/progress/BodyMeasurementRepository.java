package com.aifitx.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, UUID> {
    List<BodyMeasurement> findByUserIdOrderByMeasuredOnDesc(UUID userId);
    Optional<BodyMeasurement> findFirstByUserIdOrderByMeasuredOnDesc(UUID userId);
    Optional<BodyMeasurement> findByIdAndUserId(UUID id, UUID userId);
}
