package crypto.demo.controller;

import crypto.demo.Service.TotalPortfolioManagerService;
import crypto.demo.Service.TotalPortfolioService;
import crypto.demo.dto.TotalPortfolioDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/totalportfolio")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TotalPortfolioController {

    private final TotalPortfolioManagerService totalPortfolioManagerService;
    private final TotalPortfolioService totalPortfolioService;

    // 특정 유저 총 포트폴리오 계산 + 저장
    @PostMapping("/calculate/{userId}")
    public String calculateTotalPortfolio(@PathVariable Long userId) {
        try {
            totalPortfolioManagerService.calculateAndSaveTotalPortfolio(userId);
            return "Total portfolio calculated successfully.";
        } catch (Exception e) {
            return "Error calculating total portfolio: " + e.getMessage();
        }
    }

    // 특정 유저 총 포트폴리오 조회
    @GetMapping("/{userId}")
    public TotalPortfolioDTO getTotalPortfolio(@PathVariable Long userId) {
        return totalPortfolioService.getTotalPortfolio(userId);
    }
}
