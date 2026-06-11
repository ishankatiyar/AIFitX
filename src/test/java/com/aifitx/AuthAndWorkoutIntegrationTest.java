package com.aifitx;

import com.aifitx.exercise.Exercise;
import com.aifitx.exercise.ExerciseRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndWorkoutIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Test
    void userCanRegisterAndCreateWorkoutPlan() throws Exception {
        String registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "athlete@example.com",
                                  "password": "strong-pass-123",
                                  "displayName": "Test Athlete"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andReturn().getResponse().getContentAsString();

        JsonNode auth = objectMapper.readTree(registration);
        String token = auth.get("accessToken").asText();
        Exercise exercise = exerciseRepository.findAllByOrderByName().getFirst();

        mockMvc.perform(post("/api/workout-plans")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Strength A",
                                  "description": "Main strength day",
                                  "items": [{
                                    "exerciseId": "%s",
                                    "sets": 4,
                                    "reps": 8,
                                    "targetWeightKg": 60,
                                    "restSeconds": 120
                                  }]
                                }
                                """.formatted(exercise.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Strength A"))
                .andExpect(jsonPath("$.items[0].sets").value(4));

        mockMvc.perform(get("/api/workout-plans").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Strength A"));
    }

    @Test
    void protectedEndpointRejectsAnonymousUser() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isForbidden());
    }
}
