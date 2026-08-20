package crypto.demo.controller;

import java.util.Map;

import crypto.demo.Service.PasswordService;
import crypto.demo.dto.PasswordDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PasswordController {

    private final PasswordService passwordService;

    // 본인 확인 단계
    @PostMapping("/findpassword")
    public ResponseEntity<?> verifyUser(@RequestBody PasswordDTO.FindRequest request) {
        try {
            // 서비스를 통해 DB 일치 여부 확인 후 고유 ID 반환
            Long userId = passwordService.findUserForReset(request);
            
            // 프론트엔드에 userId를 담아서 보냄
            return ResponseEntity.ok(Map.of("userId", userId));
        } catch (RuntimeException e) {
            // 일치하는 유저가 없을 경우 404 에러와 메시지 반환
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 비밀번호 변경 단계
    @PostMapping("/resetpassword")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordDTO.ResetRequest request) {
        try {
            // 전달받은 userId의 비밀번호를 newPassword로 변경
            passwordService.updatePassword(request.getUserId(), request.getNewPassword());
            
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            // 서버 오류 등 발생 시 400 에러 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호 변경에 실패했습니다.");
        }
    }
    
}
