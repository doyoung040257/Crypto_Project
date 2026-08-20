package crypto.demo.controller;

import crypto.demo.Service.TradeService;
import crypto.demo.dto.TradeDTO;
import crypto.demo.dto.BalanceUpdateDTO;
import crypto.demo.dto.TradeCreateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TradeController {

    private final TradeService tradeService;

    // ===============================
    // 로그인 사용자 기준 거래 조회
    // userId는 로그인 후 JWT 또는 세션에서 가져오는 방식 가정
    // ===============================
    @GetMapping("/{userId}")
    public List<TradeDTO> getUserTrades(@PathVariable Long userId) {
        return tradeService.getTradesByUserId(userId);
    }

    // ===============================
    // 거래 생성
    // ===============================
    @PostMapping
    public TradeDTO createTrade(@RequestBody TradeCreateDTO dto) {
        return tradeService.createTrade(dto);
    }

    // 잔액조회
    @GetMapping("/users/{userId}")
    public BalanceUpdateDTO getUserBalance(@PathVariable Long userId) {
        return tradeService.getUserBalance(userId);
    }

}
