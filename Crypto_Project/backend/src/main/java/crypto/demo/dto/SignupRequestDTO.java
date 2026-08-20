package crypto.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SignupRequestDTO {

    // 로그인 아이디
    private String loginId;

    // 평문 비밀번호 (Service에서 암호화)
    private String password;

    private String email;
    private String realName;
    private String phone;

    // 생년월일
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthdate;

    // 약관 동의 (Y/N → Boolean 변환)
    private Boolean agreeService;
    private Boolean agreePrivacy;
}
