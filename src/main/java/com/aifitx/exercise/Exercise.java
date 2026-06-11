package com.aifitx.exercise;

import com.aifitx.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Exercise extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MuscleGroup muscleGroup;

    @Column(nullable = false)
    private String equipment;

    @Column(length = 1000)
    private String instructions;

    public Exercise(String name, MuscleGroup muscleGroup, String equipment, String instructions) {
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.equipment = equipment;
        this.instructions = instructions;
    }
}
