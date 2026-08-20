package crypto.demo.Service;

import crypto.demo.dto.PortfolioRequestDTO;
import crypto.demo.dto.PortfolioResponseDTO;
import crypto.demo.Entity.Portfolio;
import crypto.demo.Entity.PortfolioId;
import crypto.demo.repository.PortfolioRepository;
import crypto.demo.Entity.Users;
import crypto.demo.repository.UsersRepository;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UsersRepository usersRepository;
    private final MarketService marketService; // KRW 가격 조회용
    private final TotalPortfolioManagerService totalPortfolioManagerService; // 추가

    // ===============================
    // 특정 유저 포트폴리오 조회 (실시간 평가금액/손익/손익률 계산)
    // ===============================
    public List<PortfolioResponseDTO> getPortfolioByUserId(Long userId) {
        
        // 총 포트폴리오 갱신
        totalPortfolioManagerService.calculateAndSaveTotalPortfolio(userId);
        
        //특정 유저의 포트폴리오 리스트 찾기
        List<Portfolio> portfolioList = portfolioRepository.findByUser_Userid(userId);

        return portfolioList.stream()
                .map(p -> {
                    // 현재 코인 시세
                    BigDecimal currentPrice = BigDecimal.valueOf(
                            marketService.getCurrentPriceKRW(p.getId().getCryptoSymbol().toLowerCase()));

                    // 현재 평가금액 = 보유수량 * 현재 시세
                    BigDecimal evaluation = currentPrice.multiply(p.getQuantity());

                    // 현재 손익 = 평가금액 - 매수금액
                    BigDecimal profit = evaluation.subtract(p.getBuyPrice());

                    // 손익률 초기화 및 계산
                    BigDecimal profitRate = BigDecimal.ZERO;
                    if (p.getBuyPrice().compareTo(BigDecimal.ZERO) > 0) { // 매수 금액이 0보다 클 경우 계산
                        // 손익률 = (손익 / 매수금액) * 100
                        profitRate = profit.divide(p.getBuyPrice(), 4, RoundingMode.HALF_UP)
                                           .multiply(BigDecimal.valueOf(100));
                    }

                    return new PortfolioResponseDTO(
                            p.getUser().getRealName(),
                            p.getCryptoName(),
                            p.getId().getCryptoSymbol(),
                            p.getBuyPrice(),
                            p.getAveragePrice(),
                            p.getQuantity(),
                            evaluation,
                            profit,
                            profitRate,
                            p.getUpdatedDate()
                    );
                })
                .collect(Collectors.toList());
    }

    // ===============================
    // 거래 처리 (매수/매도) -> Trade 테이블 기준 계산 + 총 포트폴리오 갱신
    // ===============================
    @Transactional
    public void processTrade(PortfolioRequestDTO tradeRequest) {
        Long userId = tradeRequest.getUserId();
        String cryptoName = tradeRequest.getCryptoName();
        String cryptoSymbol = tradeRequest.getCryptoSymbol();
        BigDecimal tradePrice = tradeRequest.getTradePrice();      // 거래 단가
        BigDecimal tradeQuantity = tradeRequest.getTradeQuantity(); // 거래 수량
        String orderType = tradeRequest.getOrderType();

        Portfolio existingPortfolio = portfolioRepository.findById(new PortfolioId(userId, cryptoSymbol))
                .orElse(null);

        // 🔹 현재 코인 시세 조회
        BigDecimal currentPrice = BigDecimal.valueOf(
                marketService.getCurrentPriceKRW(cryptoSymbol)
        );

        if (existingPortfolio != null) {
            BigDecimal oldQuantity = existingPortfolio.getQuantity();
            BigDecimal oldBuyPrice = existingPortfolio.getBuyPrice();

            // 🔹 현재 보유 코인 가치 = 기존 수량 * 현재 시세
            BigDecimal currentTotalValue = oldQuantity.multiply(currentPrice);

            BigDecimal newQuantity;
            BigDecimal newBuyPrice;

            if (orderType.equalsIgnoreCase("매수")) {
                // 🔹 매수: 기존 가치 + 매수 금액
                newQuantity = oldQuantity.add(tradeQuantity);
                newBuyPrice = currentTotalValue.add(tradePrice.multiply(tradeQuantity));
            } else if (orderType.equalsIgnoreCase("매도")) {
                // 🔹 매도: 기존 가치 - 매도 금액
                newQuantity = oldQuantity.subtract(tradeQuantity);
                if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("매도 수량이 보유 수량보다 많습니다.");
                }
                newBuyPrice = currentTotalValue.subtract(tradePrice.multiply(tradeQuantity));
            } else {
                throw new IllegalArgumentException("Invalid order type: " + orderType);
            }

            // 🔹 평균 단가 계산
            BigDecimal newAveragePrice = BigDecimal.ZERO;
            if (newQuantity.compareTo(BigDecimal.ZERO) > 0) {
                newAveragePrice = newBuyPrice.divide(newQuantity, 8, RoundingMode.HALF_UP);
            }

            // 🔹 업데이트
            existingPortfolio.setBuyPrice(newBuyPrice);
            existingPortfolio.setQuantity(newQuantity);
            existingPortfolio.setAveragePrice(newAveragePrice);
            existingPortfolio.setUpdatedDate(LocalDateTime.now());

            portfolioRepository.save(existingPortfolio);

        } else {
            // 🔹 신규 포트폴리오 생성
            createNewPortfolio(userId, cryptoName, cryptoSymbol, tradePrice, tradeQuantity);
        }

        // 🔹 거래 후 총 포트폴리오 갱신
        totalPortfolioManagerService.calculateAndSaveTotalPortfolio(userId);
    }


    private void createNewPortfolio(Long userId, String cryptoName, String cryptoSymbol, BigDecimal tradePrice, BigDecimal tradeQuantity) {
        Portfolio newPortfolio = new Portfolio();
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PortfolioId portfolioId = new PortfolioId(userId, cryptoSymbol);
        newPortfolio.setId(portfolioId);
        newPortfolio.setUser(user);
        newPortfolio.setCryptoName(cryptoName); // 
        newPortfolio.setBuyPrice(tradePrice.multiply(tradeQuantity)); // 총 매수금액
        newPortfolio.setQuantity(tradeQuantity); // 총 수량
        newPortfolio.setAveragePrice(tradePrice); // 단가 = 매수금액/수량
        newPortfolio.setUpdatedDate(LocalDateTime.now());

        portfolioRepository.save(newPortfolio);
    }
}
