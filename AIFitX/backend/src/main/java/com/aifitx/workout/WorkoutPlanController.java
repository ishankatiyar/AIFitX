package com.aifitx.workout;

import com.aifitx.auth.CurrentUser;
import com.aifitx.common.NotFoundException;
import com.aifitx.exercise.Exercise;
import com.aifitx.exercise.ExerciseRepository;
import com.aifitx.user.User;
import com.aifitx.user.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static com.aifitx.workout.WorkoutPlanDtos.PlanItemRequest;
import static com.aifitx.workout.WorkoutPlanDtos.PlanResponse;
import static com.aifitx.workout.WorkoutPlanDtos.UpsertPlanRequest;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {
    private final WorkoutPlanRepository planRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    @Transactional
    public List<PlanResponse> list() {
        return planRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.id())
                .stream().map(PlanResponse::from).toList();
    }

    @GetMapping("/{id}")
    @Transactional
    public PlanResponse get(@PathVariable UUID id) {
        return PlanResponse.from(loadPlan(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public PlanResponse create(@Valid @RequestBody UpsertPlanRequest request) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
        WorkoutPlan plan = new WorkoutPlan();
        plan.setUser(user);
        apply(plan, request);
        return PlanResponse.from(planRepository.save(plan));
    }

    @PutMapping("/{id}")
    @Transactional
    public PlanResponse update(@PathVariable UUID id, @Valid @RequestBody UpsertPlanRequest request) {
        WorkoutPlan plan = loadPlan(id);
        apply(plan, request);
        return PlanResponse.from(planRepository.save(plan));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        planRepository.delete(loadPlan(id));
    }

    private void apply(WorkoutPlan plan, UpsertPlanRequest request) {
        plan.setName(request.name().trim());
        plan.setDescription(request.description());
        plan.replaceItems(request.items().stream().map(this::toItem).toList());
    }

    private WorkoutPlanItem toItem(PlanItemRequest request) {
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new NotFoundException("Exercise not found: " + request.exerciseId()));
        WorkoutPlanItem item = new WorkoutPlanItem();
        item.setExercise(exercise);
        item.setSets(request.sets());
        item.setReps(request.reps());
        item.setTargetWeightKg(request.targetWeightKg());
        item.setRestSeconds(request.restSeconds());
        return item;
    }

    private WorkoutPlan loadPlan(UUID id) {
        return planRepository.findByIdAndUserId(id, currentUser.id())
                .orElseThrow(() -> new NotFoundException("Workout plan not found"));
    }
}
