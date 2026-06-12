package com.aifitx.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public final class UserDtos {
    private UserDtos() {
    }

    public record UserResponse(
            UUID id,
            String email,
            String displayName,
            LocalDate dateOfBirth,
            Double heightCm,
            Double targetWeightKg,
            FitnessGoal fitnessGoal,
            ActivityLevel activityLevel
    ) {
        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getDisplayName(),
                    user.getDateOfBirth(),
                    user.getHeightCm(),
                    user.getTargetWeightKg(),
                    user.getFitnessGoal(),
                    user.getActivityLevel()
            );
        }
    }

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 80) String displayName,
            LocalDate dateOfBirth,
            @Positive @Min(80) @Max(250) Double heightCm,
            @Positive @Min(25) @Max(400) Double targetWeightKg,
            FitnessGoal fitnessGoal,
            ActivityLevel activityLevel
    ) {
    }
}
