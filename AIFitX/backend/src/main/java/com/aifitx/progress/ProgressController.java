package com.aifitx.progress;

import com.aifitx.auth.CurrentUser;
import com.aifitx.common.NotFoundException;
import com.aifitx.user.User;
import com.aifitx.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {
    private final BodyMeasurementRepository measurementRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public List<MeasurementResponse> list() {
        return measurementRepository.findByUserIdOrderByMeasuredOnDesc(currentUser.id())
                .stream().map(MeasurementResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeasurementResponse create(@Valid @RequestBody MeasurementRequest request) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
        BodyMeasurement measurement = new BodyMeasurement();
        measurement.setUser(user);
        measurement.setMeasuredOn(request.measuredOn());
        measurement.setWeightKg(request.weightKg());
        measurement.setBodyFatPercent(request.bodyFatPercent());
        measurement.setChestCm(request.chestCm());
        measurement.setWaistCm(request.waistCm());
        measurement.setHipsCm(request.hipsCm());
        measurement.setArmCm(request.armCm());
        measurement.setThighCm(request.thighCm());
        return MeasurementResponse.from(measurementRepository.save(measurement));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        BodyMeasurement measurement = measurementRepository.findByIdAndUserId(id, currentUser.id())
                .orElseThrow(() -> new NotFoundException("Body measurement not found"));
        measurementRepository.delete(measurement);
    }

    public record MeasurementRequest(
            @NotNull LocalDate measuredOn,
            @Positive @Min(25) @Max(400) double weightKg,
            @Positive @Max(80) Double bodyFatPercent,
            @Positive Double chestCm,
            @Positive Double waistCm,
            @Positive Double hipsCm,
            @Positive Double armCm,
            @Positive Double thighCm
    ) {
    }

    public record MeasurementResponse(
            UUID id,
            LocalDate measuredOn,
            double weightKg,
            Double bodyFatPercent,
            Double chestCm,
            Double waistCm,
            Double hipsCm,
            Double armCm,
            Double thighCm
    ) {
        static MeasurementResponse from(BodyMeasurement measurement) {
            return new MeasurementResponse(
                    measurement.getId(),
                    measurement.getMeasuredOn(),
                    measurement.getWeightKg(),
                    measurement.getBodyFatPercent(),
                    measurement.getChestCm(),
                    measurement.getWaistCm(),
                    measurement.getHipsCm(),
                    measurement.getArmCm(),
                    measurement.getThighCm()
            );
        }
    }
}
