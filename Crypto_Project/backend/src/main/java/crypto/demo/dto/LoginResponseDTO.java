package crypto.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private Long userid;
    private String loginId;
    private String realName;
    private BigDecimal balance;
}