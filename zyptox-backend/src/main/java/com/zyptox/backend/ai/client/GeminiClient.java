package com.zyptox.backend.ai.client;

import com.zyptox.backend.ai.config.GeminiConfig;
import com.zyptox.backend.ai.dto.gemini.*;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GeminiClient {

    private final RestClient restClient;
    private final GeminiConfig geminiConfig;

    public GeminiClient(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        this.restClient = RestClient.builder().build();
    }

    public GeminiResponse generateResponse(String prompt) {

        GeminiRequest request = buildRequest(prompt);

        String url =
                "https://generativelanguage.googleapis.com/v1/models/"
                        + geminiConfig.getModel()
                        + ":generateContent";
        String apiKey = geminiConfig.getApiKey();
        System.out.println("--- Gemini AI Diagnostic Log ---");
        System.out.println("Using Model: " + geminiConfig.getModel());
        System.out.println("API Key Loaded Length: " + (apiKey != null ? apiKey.length() : 0));
        System.out.println("API Key Loaded Prefix: " + (apiKey != null && apiKey.length() > 10 ? apiKey.substring(0, 10) : "N/A"));
        System.out.println("Target URL: " + url);
        System.out.println("--------------------------------");

        boolean isAccessToken = apiKey != null && (apiKey.startsWith("AQ.") || apiKey.startsWith("ya29."));

        try {
            var spec = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request);
            
            if (isAccessToken) {
                spec.header("Authorization", "Bearer " + apiKey);
            } else {
                spec.header("x-goog-api-key", apiKey);
            }

            return spec.retrieve().body(GeminiResponse.class);
        } catch (Exception e) {
            System.out.println("--- ERROR: Listing Authorized Models for Diagnostic ---");
            try {
                String listUrl = "https://generativelanguage.googleapis.com/v1/models";
                var getSpec = restClient.get().uri(listUrl);
                if (isAccessToken) {
                    getSpec.header("Authorization", "Bearer " + apiKey);
                } else {
                    getSpec.header("x-goog-api-key", apiKey);
                }
                String responseBody = getSpec.retrieve().body(String.class);
                System.out.println("Available Models: " + responseBody);
            } catch (Exception listEx) {
                System.out.println("Failed to list models. Error: " + listEx.getMessage());
            }
            System.out.println("-------------------------------------------------------");
            throw e;
        }
    }

    private GeminiRequest buildRequest(String prompt) {

        Part part = new Part(prompt);

        Content content = new Content(List.of(part));

        return new GeminiRequest(List.of(content));
    }
}