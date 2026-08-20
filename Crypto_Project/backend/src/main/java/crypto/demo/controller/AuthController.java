package crypto.demo.controller;

import crypto.demo.Service.AuthService;
import crypto.demo.dto.LoginRequestDTO;
import crypto.demo.dto.LoginResponseDTO;
import crypto.demo.dto.SignupRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    // ===============================
    // 회원가입
    // ===============================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO dto) {
        authService.signup(dto);
        return ResponseEntity.ok(Map.of(
            "message", "회원가입 성공"
        ));
    }

    // ===============================
    // 로그인
    // ===============================
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    // ===============================
    // 아이디 중복 체크
    // ===============================
    @GetMapping("/check-loginId")
    public ResponseEntity<Map<String, Boolean>> checkLoginId(
            @RequestParam String loginId
    ) {
        boolean available = authService.isLoginIdAvailable(loginId);
        return ResponseEntity.ok(Map.of(
            "available", available
        ));
    }

    // ===============================
    // 이메일 중복 체크
    // ===============================
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(
            @RequestParam String email
    ) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of(
            "available", available
        ));
    }
}
