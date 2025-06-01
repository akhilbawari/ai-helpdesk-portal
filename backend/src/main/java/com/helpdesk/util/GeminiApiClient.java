package com.helpdesk.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiApiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    /**
     * Makes a request to the Gemini API with the given prompt
     *
     * @param prompt The prompt to send to Gemini
     * @return The response from Gemini
     */
    public String generateContent(String prompt) {
        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            
            content.put("parts", parts);
            content.put("role", "user");
            
            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(content);
            
            requestBody.put("contents", contents);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromResponse(response.getBody());
            } else {
                log.error("Error calling Gemini API: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return null;
        }
    }
    
    /**
     * Makes a structured request to the Gemini API with the given prompt and expects a JSON response
     *
     * @param prompt The prompt to send to Gemini
     * @return The parsed JSON response from Gemini
     */
    public JsonNode generateStructuredContent(String prompt) {
        String jsonResponse = generateContent(prompt + "\n\nRespond with valid JSON only. Do not include any explanations, markdown formatting, or text outside the JSON object.");

        if (jsonResponse != null && !jsonResponse.trim().isEmpty()) {
            try {
                // Clean the response to extract only JSON
                String cleanedJson = extractJsonFromResponse(jsonResponse);

                if (cleanedJson != null && !cleanedJson.trim().isEmpty()) {
                    JsonNode rootNode = objectMapper.readTree(cleanedJson);
                    return rootNode;
                } else {
                    log.warn("No valid JSON found in response: {}", jsonResponse);
                    return createErrorNode("No valid JSON found in response");
                }
            } catch (JsonProcessingException e) {
                log.error("Error parsing JSON response from Gemini. Response: {}", jsonResponse, e);
                return createErrorNode("Invalid JSON format: " + e.getMessage());
            }
        }

        log.warn("Empty or null response from generateContent");
        return createErrorNode("Empty or null response");
    }
    
    /**
     * Extracts the text content from the Gemini API response
     *
     * @param responseBody The full response body from Gemini
     * @return The extracted text content
     */
    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode candidates = rootNode.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            
            log.error("Unexpected response format from Gemini API: {}", responseBody);
            return null;
        } catch (JsonProcessingException e) {
            log.error("Error parsing Gemini API response", e);
            return null;
        }
    }
    private String extractJsonFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return null;
        }

        String trimmed = response.trim();

        // Remove markdown code blocks if present
        if (trimmed.startsWith("```json") && trimmed.endsWith("```")) {
            trimmed = trimmed.substring(7, trimmed.length() - 3).trim();
        } else if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
            trimmed = trimmed.substring(3, trimmed.length() - 3).trim();
        }

        // Find JSON object boundaries
        int jsonStart = -1;
        int jsonEnd = -1;

        // Look for opening brace
        for (int i = 0; i < trimmed.length(); i++) {
            if (trimmed.charAt(i) == '{') {
                jsonStart = i;
                break;
            }
        }

        if (jsonStart == -1) {
            return null; // No JSON object found
        }

        // Find matching closing brace
        int braceCount = 0;
        for (int i = jsonStart; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (c == '{') {
                braceCount++;
            } else if (c == '}') {
                braceCount--;
                if (braceCount == 0) {
                    jsonEnd = i;
                    break;
                }
            }
        }

        if (jsonEnd == -1) {
            return null; // No matching closing brace found
        }

        return trimmed.substring(jsonStart, jsonEnd + 1);
    }

    /**
     * Creates an error node for consistent error handling
     */
    private JsonNode createErrorNode(String errorMessage) {
        try {
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", true);
            errorNode.put("message", errorMessage);
            errorNode.put("timestamp", System.currentTimeMillis());
            return errorNode;
        } catch (Exception e) {
            log.error("Failed to create error node", e);
            return null;
        }
    }

    /**
     * Alternative method with retry mechanism
     */
    public JsonNode generateStructuredContentWithRetry(String prompt, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String enhancedPrompt = prompt +
                        "\n\nIMPORTANT: Respond with ONLY valid JSON. " +
                        "No explanations, no markdown, no additional text. " +
                        "Start with { and end with }.";

                JsonNode result = generateStructuredContent(enhancedPrompt);

                // Check if result is valid (not an error node)
                if (result != null && !result.has("error")) {
                    return result;
                }

                if (attempt < maxRetries) {
                    log.warn("Attempt {} failed, retrying...", attempt);
                    Thread.sleep(1000); // Wait 1 second before retry
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Retry interrupted", e);
                break;
            } catch (Exception e) {
                log.error("Attempt {} failed with exception", attempt, e);
            }
        }

        return createErrorNode("Failed to generate valid JSON after " + maxRetries + " attempts");
    }
}
