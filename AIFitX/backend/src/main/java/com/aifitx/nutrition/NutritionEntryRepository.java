package com.aifitx.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, UUID> {
    List<NutritionEntry> findByUserIdAndConsumedOnOrderByCreatedAt(UUID userId, LocalDate consumedOn);
    Optional<NutritionEntry> findByIdAndUserId(UUID id, UUID userId);
}
