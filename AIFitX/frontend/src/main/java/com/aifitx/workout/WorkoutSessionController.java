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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static com.aifitx.workout.WorkoutSessionDtos.CreateSessionRequest;
import static com.aifitx.workout.WorkoutSessionDtos.SessionExerciseRequest;
import static com.aifitx.workout.WorkoutSessionDtos.SessionResponse;

@RestController
@RequestMapping("/api/workout-sessions")
@RequiredArgsConstructor
public class WorkoutSessionController {
    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutPlanRepository planRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    @Transactional
    public List<SessionResponse> list() {
        return sessionRepository.findByUserIdOrderByCompletedAtDesc(currentUser.id())
                .stream().map(SessionResponse::from).toList();
    }

    @GetMapping("/{id}")
    @Transactional
    public SessionResponse get(@PathVariable UUID id) {
        return SessionResponse.from(loadSession(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SessionResponse create(@Valid @RequestBody CreateSessionRequest request) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setName(request.name().trim());
        session.setCompletedAt(request.completedAt() == null ? Instant.now() : request.completedAt());
        session.setDurationMinutes(request.durationMinutes());
        session.setCaloriesBurned(request.caloriesBurned());
        session.setNotes(request.notes());
        if (request.planId() != null) {
            session.setPlan(planRepository.findByIdAndUserId(request.planId(), currentUser.id())
                    .orElseThrow(() -> new NotFoundException("Workout plan not found")));
        }
        request.exercises().stream().map(this::toExercise).forEach(session::addExercise);
        return SessionResponse.from(sessionRepository.save(session));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        sessionRepository.delete(loadSession(id));
    }

    private WorkoutSessionExercise toExercise(SessionExerciseRequest request) {
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new NotFoundException("Exercise not found: " + request.exerciseId()));
        WorkoutSessionExercise log = new WorkoutSessionExercise();
        log.setExercise(exercise);
        log.setSetsCompleted(request.setsCompleted());
        log.setRepsPerSet(request.repsPerSet());
        log.setWeightKg(request.weightKg());
        log.setDurationSeconds(request.durationSeconds());
        return log;
    }

    private WorkoutSession loadSession(UUID id) {
        return sessionRepository.findByIdAndUserId(id, currentUser.id())
                .orElseThrow(() -> new NotFoundException("Workout session not found"));
    }
}
