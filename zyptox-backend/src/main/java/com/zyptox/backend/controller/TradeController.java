package com.zyptox.backend.controller;

import com.zyptox.backend.dto.UserSession;
import com.zyptox.backend.dto.request.TradeRequest;
import com.zyptox.backend.dto.response.TradeResponse;
import com.zyptox.backend.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @PostMapping("/execute")
    public TradeResponse executeTrade(@Valid @RequestBody TradeRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserSession session = (UserSession) authentication.getPrincipal();
        return tradeService.executeTrade(session.getId(), request.getSymbol(), request.getAction(), request.getAmount());
    }
}
