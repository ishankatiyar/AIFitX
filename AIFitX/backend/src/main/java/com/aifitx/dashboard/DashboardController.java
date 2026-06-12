package com.aifitx.dashboard;

import com.aifitx.auth.CurrentUser;
import com.aifitx.nutrition.NutritionEntry;
import com.aifitx.nutrition.NutritionEntryRepository;
import com.aifitx.progress.BodyMeasurementRepository;
import com.aifitx.workout.WorkoutPlanRepository;
import com.aifitx.workout.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final CurrentUser currentUser;
    private final WorkoutPlanRepository planRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final NutritionEntryRepository nutritionRepository;
    private final BodyMeasurementRepository measurementRepository;

    @GetMapping
    public DashboardResponse dashboard() {
        var userId = currentUser.id();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant weekStart = today.minusDays(6).atStartOfDay().toInstant(ZoneOffset.UTC);
        int caloriesToday = nutritionRepository.findByUserIdAndConsumedOnOrderByCreatedAt(userId, today)
                .stream().mapToInt(NutritionEntry::getCalories).sum();
        Double latestWeight = measurementRepository.findFirstByUserIdOrderByMeasuredOnDesc(userId)
                .map(measurement -> measurement.getWeightKg())
                .orElse(null);
        return new DashboardResponse(
                planRepository.findByUserIdOrderByUpdatedAtDesc(userId).size(),
                sessionRepository.countByUserIdAndCompletedAtGreaterThanEqual(userId, weekStart),
                caloriesToday,
                latestWeight
        );
    }

    public record DashboardResponse(
            int workoutPlanCount,
            long workoutsLast7Days,
            int caloriesToday,
            Double latestWeightKg
    ) {
    }
}
