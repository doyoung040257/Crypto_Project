package crypto.demo.dto;

import lombok.Getter;
import lombok.Setter;

public class PasswordDTO {
    
    // 1. 본인 확인용 요청 데이터
    @Getter @Setter
    public static class FindRequest {
        private String loginId;
        private String realName;
        private String phone;
    }

    // 2. 새 비밀번호 설정용 데이터
    @Getter @Setter
    public static class ResetRequest {
        private Long userId;
        private String newPassword;
    }
    
}
