package com.aifitx.exercise;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseRepository exerciseRepository;

    @GetMapping
    public List<ExerciseResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) MuscleGroup muscleGroup
    ) {
        List<Exercise> exercises;
        if (query != null && !query.isBlank()) {
            exercises = exerciseRepository.findByNameContainingIgnoreCaseOrderByName(query.trim());
        } else if (muscleGroup != null) {
            exercises = exerciseRepository.findByMuscleGroupOrderByName(muscleGroup);
        } else {
            exercises = exerciseRepository.findAllByOrderByName();
        }
        return exercises.stream().map(ExerciseResponse::from).toList();
    }

    public record ExerciseResponse(
            UUID id,
            String name,
            MuscleGroup muscleGroup,
            String equipment,
            String instructions
    ) {
        static ExerciseResponse from(Exercise exercise) {
            return new ExerciseResponse(
                    exercise.getId(),
                    exercise.getName(),
                    exercise.getMuscleGroup(),
                    exercise.getEquipment(),
                    exercise.getInstructions()
            );
        }
    }
}
