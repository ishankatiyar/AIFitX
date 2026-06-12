package com.aifitx.exercise;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByNameContainingIgnoreCaseOrderByName(String query);
    List<Exercise> findByMuscleGroupOrderByName(MuscleGroup muscleGroup);
    List<Exercise> findAllByOrderByName();
    boolean existsByNameIgnoreCase(String name);
}
