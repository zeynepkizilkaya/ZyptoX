package com.zyptox.backend.ai.controller;

import com.zyptox.backend.ai.dto.ChatRequest;
import com.zyptox.backend.ai.dto.ChatResponse;
import com.zyptox.backend.ai.service.AIChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIChatService aiChatService;

    public AIChatController(AIChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request
    ) {

        ChatResponse response = aiChatService.chat(request.getMessage());

        return ResponseEntity.ok(response);
    }

}