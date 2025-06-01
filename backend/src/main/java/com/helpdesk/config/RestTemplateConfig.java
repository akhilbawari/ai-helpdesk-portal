package com.helpdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    @Primary
    public RestTemplate geminiRestTemplate() {
        // This bean will be used for Gemini API calls
        // We can customize it with specific configurations if needed
        return new RestTemplate();
    }
}
