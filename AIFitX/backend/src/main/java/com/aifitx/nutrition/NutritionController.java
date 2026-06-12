package com.aifitx.nutrition;

import com.aifitx.auth.CurrentUser;
import com.aifitx.common.NotFoundException;
import com.aifitx.user.User;
import com.aifitx.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {
    private final NutritionEntryRepository nutritionRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public DailyNutritionResponse daily(@RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}") LocalDate date) {
        List<NutritionResponse> entries = nutritionRepository
                .findByUserIdAndConsumedOnOrderByCreatedAt(currentUser.id(), date)
                .stream().map(NutritionResponse::from).toList();
        return DailyNutritionResponse.from(date, entries);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionResponse create(@Valid @RequestBody NutritionRequest request) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
        NutritionEntry entry = new NutritionEntry();
        entry.setUser(user);
        entry.setConsumedOn(request.consumedOn());
        entry.setMealType(request.mealType());
        entry.setFoodName(request.foodName().trim());
        entry.setCalories(request.calories());
        entry.setProteinGrams(request.proteinGrams());
        entry.setCarbsGrams(request.carbsGrams());
        entry.setFatGrams(request.fatGrams());
        return NutritionResponse.from(nutritionRepository.save(entry));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        NutritionEntry entry = nutritionRepository.findByIdAndUserId(id, currentUser.id())
                .orElseThrow(() -> new NotFoundException("Nutrition entry not found"));
        nutritionRepository.delete(entry);
    }

    public record NutritionRequest(
            @NotNull LocalDate consumedOn,
            @NotNull MealType mealType,
            @NotBlank @Size(max = 120) String foodName,
            @Min(0) @Max(10000) int calories,
            @PositiveOrZero double proteinGrams,
            @PositiveOrZero double carbsGrams,
            @PositiveOrZero double fatGrams
    ) {
    }

    public record NutritionResponse(
            UUID id,
            LocalDate consumedOn,
            MealType mealType,
            String foodName,
            int calories,
            double proteinGrams,
            double carbsGrams,
            double fatGrams
    ) {
        static NutritionResponse from(NutritionEntry entry) {
            return new NutritionResponse(
                    entry.getId(),
                    entry.getConsumedOn(),
                    entry.getMealType(),
                    entry.getFoodName(),
                    entry.getCalories(),
                    entry.getProteinGrams(),
                    entry.getCarbsGrams(),
                    entry.getFatGrams()
            );
        }
    }

    public record DailyNutritionResponse(
            LocalDate date,
            int totalCalories,
            double totalProteinGrams,
            double totalCarbsGrams,
            double totalFatGrams,
            List<NutritionResponse> entries
    ) {
        static DailyNutritionResponse from(LocalDate date, List<NutritionResponse> entries) {
            return new DailyNutritionResponse(
                    date,
                    entries.stream().mapToInt(NutritionResponse::calories).sum(),
                    entries.stream().mapToDouble(NutritionResponse::proteinGrams).sum(),
                    entries.stream().mapToDouble(NutritionResponse::carbsGrams).sum(),
                    entries.stream().mapToDouble(NutritionResponse::fatGrams).sum(),
                    entries
            );
        }
    }
}
