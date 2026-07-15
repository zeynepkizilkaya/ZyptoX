package com.zyptox.backend.ai.service;

import com.zyptox.backend.ai.client.GeminiClient;
import com.zyptox.backend.ai.context.ContextBuilder;
import com.zyptox.backend.ai.dto.ChatResponse;
import com.zyptox.backend.ai.dto.UserContext;
import com.zyptox.backend.ai.dto.gemini.GeminiResponse;
import com.zyptox.backend.ai.parser.ResponseParser;
import com.zyptox.backend.ai.prompt.PromptBuilder;
import org.springframework.stereotype.Service;

@Service
public class AIChatService {

    private final ContextBuilder contextBuilder;
    private final PromptBuilder promptBuilder;
    private final GeminiClient geminiClient;
    private final ResponseParser responseParser;

    public AIChatService(
            ContextBuilder contextBuilder,
            PromptBuilder promptBuilder,
            GeminiClient geminiClient,
            ResponseParser responseParser) {

        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.geminiClient = geminiClient;
        this.responseParser = responseParser;
    }

    public ChatResponse chat(String message) {

        UserContext context = contextBuilder.buildContext(1L);

        String prompt = promptBuilder.buildPrompt(context, message);

        GeminiResponse response = geminiClient.generateResponse(prompt);

        String answer = responseParser.parse(response);

        return new ChatResponse(answer);
    }
}