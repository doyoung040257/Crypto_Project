package crypto.demo.dto;

import crypto.demo.Entity.Users;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    // ===============================
    // Users 엔티티와 매핑
    // ===============================
    private Long userid;                 // USER_ID (PK)
    private String loginId;
    private String password;         // ❗ 요청(Request)에서만 사용
    private String email;
    private String realName;
    private String phone;
    private LocalDate birthdate;
    private BigDecimal balance;
    private Boolean agreeService;
    private Boolean agreePrivacy;
    private LocalDateTime createdDate; // 응답(Response) 전용

    // ===============================
    // Entity → DTO (Response)
    // ⚠️ password 제외 (보안)
    // ===============================
    public static UserDTO fromEntity(Users user) {
        return new UserDTO(
            user.getUserid(),
            user.getLoginId(),
            null, // password 노출 방지
            user.getEmail(),
            user.getRealName(),
            user.getPhone(),
            user.getBirthdate(),
            user.getBalance(),
            user.getAgreeService(),
            user.getAgreePrivacy(),
            user.getCreatedDate()
        );
    }

    // ===============================
    // DTO → Entity (Create 용)
    // ===============================
    public Users toEntity() {
        Users user = new Users();
        user.setLoginId(this.loginId);
        user.setPassword(this.password);
        user.setEmail(this.email);
        user.setRealName(this.realName);
        user.setPhone(this.phone);
        user.setBirthdate(this.birthdate);
        user.setBalance(
            this.balance != null ? this.balance : BigDecimal.ZERO
        );
        user.setAgreeService(this.agreeService);
        user.setAgreePrivacy(this.agreePrivacy);
        return user;
    }
}
