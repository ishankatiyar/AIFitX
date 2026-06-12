package com.aifitx.workout;

import com.aifitx.common.BaseEntity;
import com.aifitx.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class WorkoutSession extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private WorkoutPlan plan;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Instant completedAt;

    private Integer durationMinutes;
    private Integer caloriesBurned;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "position")
    private List<WorkoutSessionExercise> exercises = new ArrayList<>();

    public void addExercise(WorkoutSessionExercise exercise) {
        exercises.add(exercise);
        exercise.setSession(this);
    }
}
