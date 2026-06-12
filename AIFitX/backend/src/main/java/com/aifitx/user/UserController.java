package com.aifitx.user;

import com.aifitx.auth.CurrentUser;
import com.aifitx.common.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.aifitx.user.UserDtos.UpdateProfileRequest;
import static com.aifitx.user.UserDtos.UserResponse;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public UserResponse getProfile() {
        return UserResponse.from(loadUser());
    }

    @PutMapping
    public UserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = loadUser();
        user.setDisplayName(request.displayName().trim());
        user.setDateOfBirth(request.dateOfBirth());
        user.setHeightCm(request.heightCm());
        user.setTargetWeightKg(request.targetWeightKg());
        user.setFitnessGoal(request.fitnessGoal());
        user.setActivityLevel(request.activityLevel());
        return UserResponse.from(userRepository.save(user));
    }

    private User loadUser() {
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
