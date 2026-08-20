package crypto.demo.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BalanceUpdateDTO {
    private Long userId;        // 새로 추가
    private BigDecimal balance;
}
