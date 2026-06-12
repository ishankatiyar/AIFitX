package com.aifitx.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public final class WorkoutPlanDtos {
    private WorkoutPlanDtos() {
    }

    public record PlanItemRequest(
            @NotNull UUID exerciseId,
            @Min(1) @Max(20) int sets,
            @Min(1) @Max(100) int reps,
            @PositiveOrZero Double targetWeightKg,
            @Min(0) @Max(1800) Integer restSeconds
    ) {
    }

    public record UpsertPlanRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 500) String description,
            @NotEmpty @Size(max = 50) List<@Valid PlanItemRequest> items
    ) {
    }

    public record PlanItemResponse(
            UUID id,
            UUID exerciseId,
            String exerciseName,
            int sets,
            int reps,
            Double targetWeightKg,
            Integer restSeconds
    ) {
        static PlanItemResponse from(WorkoutPlanItem item) {
            return new PlanItemResponse(
                    item.getId(),
                    item.getExercise().getId(),
                    item.getExercise().getName(),
                    item.getSets(),
                    item.getReps(),
                    item.getTargetWeightKg(),
                    item.getRestSeconds()
            );
        }
    }

    public record PlanResponse(
            UUID id,
            String name,
            String description,
            List<PlanItemResponse> items
    ) {
        static PlanResponse from(WorkoutPlan plan) {
            return new PlanResponse(
                    plan.getId(),
                    plan.getName(),
                    plan.getDescription(),
                    plan.getItems().stream().map(PlanItemResponse::from).toList()
            );
        }
    }
}
