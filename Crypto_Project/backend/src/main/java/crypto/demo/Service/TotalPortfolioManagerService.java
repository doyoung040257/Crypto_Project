package crypto.demo.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import crypto.demo.Entity.Portfolio;
import crypto.demo.Entity.Users;
import crypto.demo.dto.TotalPortfolioDTO;
import crypto.demo.repository.PortfolioRepository;
import crypto.demo.repository.UsersRepository;

@Service
@RequiredArgsConstructor
public class TotalPortfolioManagerService {

    private final PortfolioRepository portfolioRepository;
    private final MarketService marketService;
    private final TotalPortfolioService totalPortfolioService;
    private final UsersRepository usersRepository; // 추가

    public void calculateAndSaveTotalPortfolio(Long userId) {

        List<Portfolio> portfolioList = portfolioRepository.findByUser_Userid(userId);
        if (portfolioList.isEmpty()) return;

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalEvaluation = BigDecimal.ZERO;

        // 포트폴리오 반복 계산
        for (Portfolio p : portfolioList) {
            BigDecimal invested = p.getBuyPrice(); // 매수금액
            BigDecimal quantity = p.getQuantity(); // 수량
            BigDecimal currentPriceKrw = BigDecimal.valueOf( // 현재 코인시세
                    marketService.getCurrentPriceKRW(p.getId().getCryptoSymbol().toLowerCase()));

            BigDecimal evaluation = currentPriceKrw.multiply(quantity);

            totalInvested = totalInvested.add(invested);     // 총 매수금액 누적
            totalEvaluation = totalEvaluation.add(evaluation); // 총 평가금액 누적
        }

        // 💰 사용자 잔액 조회
        BigDecimal userBalance = usersRepository.findById(userId)
                .map(Users::getBalance)
                .orElse(BigDecimal.ZERO);

        BigDecimal InitialCapital = BigDecimal.valueOf(10000000);

        // 🔹 총 손익 계산: 총 평가금액 + 잔액 - 총 매수금액
        BigDecimal totalProfit = totalEvaluation.subtract(totalInvested);

        // 🔹 총 수익률 계산: (총 평가금액 + 잔액) / 총 매수금액 * 100
        BigDecimal totalRate = BigDecimal.ZERO;

        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalRate = totalEvaluation.add(userBalance).subtract(InitialCapital)  // 총 자산
                                    .divide(InitialCapital, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)); // 퍼센트 변환
        }

        TotalPortfolioDTO totalDto = new TotalPortfolioDTO();
        totalDto.setUserId(userId);
        totalDto.setTotalInvested(totalInvested);
        totalDto.setTotalEvaluation(totalEvaluation);
        totalDto.setTotalProfit(totalProfit);
        totalDto.setTotalRate(totalRate);

        totalPortfolioService.saveOrUpdate(totalDto);
    }
}
