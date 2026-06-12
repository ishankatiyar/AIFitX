package com.aifitx.exercise;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExerciseSeeder implements CommandLineRunner {
    private final ExerciseRepository exerciseRepository;

    @Override
    public void run(String... args) {
        if (exerciseRepository.count() > 0) {
            return;
        }
        exerciseRepository.saveAll(List.of(
                new Exercise("Push-up", MuscleGroup.CHEST, "Bodyweight", "Keep a straight body line and lower your chest under control."),
                new Exercise("Bench Press", MuscleGroup.CHEST, "Barbell", "Lower the bar to mid-chest and press while keeping feet planted."),
                new Exercise("Pull-up", MuscleGroup.BACK, "Pull-up bar", "Pull until the chin clears the bar without swinging."),
                new Exercise("Bent-over Row", MuscleGroup.BACK, "Barbell", "Brace the torso and row the bar toward the lower ribs."),
                new Exercise("Overhead Press", MuscleGroup.SHOULDERS, "Barbell", "Press overhead while keeping ribs down and core braced."),
                new Exercise("Biceps Curl", MuscleGroup.ARMS, "Dumbbells", "Curl without moving the upper arms or using momentum."),
                new Exercise("Plank", MuscleGroup.CORE, "Bodyweight", "Brace the core and maintain a neutral spine."),
                new Exercise("Back Squat", MuscleGroup.LEGS, "Barbell", "Descend with knees tracking over toes, then drive through the floor."),
                new Exercise("Romanian Deadlift", MuscleGroup.GLUTES, "Barbell", "Hinge at the hips while maintaining a neutral spine."),
                new Exercise("Walking Lunge", MuscleGroup.LEGS, "Dumbbells", "Step forward and lower both knees with an upright torso."),
                new Exercise("Burpee", MuscleGroup.FULL_BODY, "Bodyweight", "Move from standing to plank and back with controlled speed."),
                new Exercise("Running", MuscleGroup.CARDIO, "None", "Run at a sustainable pace with relaxed shoulders.")
        ));
    }
}
