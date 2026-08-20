package crypto.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TotalPortfolioDTO {
    private Long userId;
    private BigDecimal totalInvested;
    private BigDecimal totalEvaluation;
    private BigDecimal totalProfit;
    private BigDecimal totalRate;
}
