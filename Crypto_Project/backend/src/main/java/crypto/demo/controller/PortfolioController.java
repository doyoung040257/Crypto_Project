package crypto.demo.controller;

import crypto.demo.Service.PortfolioService;
import crypto.demo.Service.TotalPortfolioManagerService;
import crypto.demo.dto.PortfolioRequestDTO;
import crypto.demo.dto.PortfolioResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    // 거래 생성 / 매수/매도
    @PostMapping("/execute")
    public String executeTrade(@RequestBody PortfolioRequestDTO tradeRequest) {
        try {
            portfolioService.processTrade(tradeRequest);
            return "Trade executed successfully.";
        } catch (Exception e) {
            return "Error executing trade: " + e.getMessage();
        }
    }

    // 특정 유저 포트폴리오 조회
    @GetMapping("/{userId}")
    public List<PortfolioResponseDTO> getPortfolio(@PathVariable Long userId) {
        return portfolioService.getPortfolioByUserId(userId);
    }
}

