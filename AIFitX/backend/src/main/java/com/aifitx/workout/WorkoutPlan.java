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

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class WorkoutPlan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "position")
    private List<WorkoutPlanItem> items = new ArrayList<>();

    public void addItem(WorkoutPlanItem item) {
        items.add(item);
        item.setPlan(this);
    }

    public void replaceItems(List<WorkoutPlanItem> newItems) {
        items.clear();
        newItems.forEach(this::addItem);
    }
}
