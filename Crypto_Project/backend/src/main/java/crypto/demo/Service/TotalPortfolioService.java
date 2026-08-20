package crypto.demo.Service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import crypto.demo.Entity.TotalPortfolio;
import crypto.demo.Entity.Users;
import crypto.demo.dto.TotalPortfolioDTO;
import crypto.demo.repository.TotalPortfolioRepository;
import crypto.demo.repository.UsersRepository;

@Service
@RequiredArgsConstructor
public class TotalPortfolioService {

    private final TotalPortfolioRepository totalPortfolioRepository;
    private final UsersRepository usersRepository;

    // 포트폴리오 총계 저장
    public void saveOrUpdate(TotalPortfolioDTO dto) {

        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        TotalPortfolio totalPortfolio =
                totalPortfolioRepository.findByUser(user)
                        .orElse(TotalPortfolio.builder()
                                .user(user)
                                .build()
                        );

        totalPortfolio.setTotalInvested(dto.getTotalInvested());
        totalPortfolio.setTotalEvaluation(dto.getTotalEvaluation());
        totalPortfolio.setTotalProfit(dto.getTotalProfit());
        totalPortfolio.setTotalRate(dto.getTotalRate());

        totalPortfolioRepository.save(totalPortfolio);
    }

    // 포트폴리오 총계 조회
    public TotalPortfolioDTO getTotalPortfolio(Long userId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        TotalPortfolio totalPortfolio = totalPortfolioRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("총 포트폴리오 없음"));

        return new TotalPortfolioDTO(
                user.getUserid(),
                totalPortfolio.getTotalInvested(),
                totalPortfolio.getTotalEvaluation(),
                totalPortfolio.getTotalProfit(),
                totalPortfolio.getTotalRate()
        );
    }

    
}
