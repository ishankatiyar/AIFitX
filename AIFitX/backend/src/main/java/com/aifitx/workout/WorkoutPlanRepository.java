package com.aifitx.workout;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {
    @EntityGraph(attributePaths = {"items", "items.exercise"})
    List<WorkoutPlan> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"items", "items.exercise"})
    Optional<WorkoutPlan> findByIdAndUserId(UUID id, UUID userId);
}
