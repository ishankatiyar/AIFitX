package com.aifitx.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class WorkoutSessionDtos {
    private WorkoutSessionDtos() {
    }

    public record SessionExerciseRequest(
            @NotNull UUID exerciseId,
            @Min(1) @Max(100) int setsCompleted,
            @Min(1) @Max(1000) Integer repsPerSet,
            @PositiveOrZero Double weightKg,
            @Min(1) Integer durationSeconds
    ) {
    }

    public record CreateSessionRequest(
            UUID planId,
            @NotBlank @Size(max = 100) String name,
            Instant completedAt,
            @Min(1) @Max(1440) Integer durationMinutes,
            @PositiveOrZero Integer caloriesBurned,
            @Size(max = 1000) String notes,
            @NotEmpty @Size(max = 100) List<@Valid SessionExerciseRequest> exercises
    ) {
    }

    public record SessionExerciseResponse(
            UUID exerciseId,
            String exerciseName,
            int setsCompleted,
            Integer repsPerSet,
            Double weightKg,
            Integer durationSeconds
    ) {
        static SessionExerciseResponse from(WorkoutSessionExercise exercise) {
            return new SessionExerciseResponse(
                    exercise.getExercise().getId(),
                    exercise.getExercise().getName(),
                    exercise.getSetsCompleted(),
                    exercise.getRepsPerSet(),
                    exercise.getWeightKg(),
                    exercise.getDurationSeconds()
            );
        }
    }

    public record SessionResponse(
            UUID id,
            UUID planId,
            String name,
            Instant completedAt,
            Integer durationMinutes,
            Integer caloriesBurned,
            String notes,
            List<SessionExerciseResponse> exercises
    ) {
        static SessionResponse from(WorkoutSession session) {
            return new SessionResponse(
                    session.getId(),
                    session.getPlan() == null ? null : session.getPlan().getId(),
                    session.getName(),
                    session.getCompletedAt(),
                    session.getDurationMinutes(),
                    session.getCaloriesBurned(),
                    session.getNotes(),
                    session.getExercises().stream().map(SessionExerciseResponse::from).toList()
            );
        }
    }
}
