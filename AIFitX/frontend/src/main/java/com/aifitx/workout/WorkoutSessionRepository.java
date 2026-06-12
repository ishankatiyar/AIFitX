package com.aifitx.workout;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    @EntityGraph(attributePaths = {"plan", "exercises", "exercises.exercise"})
    List<WorkoutSession> findByUserIdOrderByCompletedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"plan", "exercises", "exercises.exercise"})
    Optional<WorkoutSession> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndCompletedAtGreaterThanEqual(UUID userId, Instant from);
}
