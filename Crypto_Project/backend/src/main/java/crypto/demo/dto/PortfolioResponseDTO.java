package crypto.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponseDTO {

    private String userName;
    private String cryptoName;
    private String cryptoSymbol;
    private BigDecimal buyPrice;
    private BigDecimal averagePrice;
    private BigDecimal quantity;
    private BigDecimal evaluationPrice; // 평가금액
    private BigDecimal profit;          // 손익
    private BigDecimal profitRate;      // 손익률 (%)
    private LocalDateTime updatedDate;
}
