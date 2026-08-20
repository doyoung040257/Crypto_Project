package crypto.demo.Service;

import crypto.demo.Entity.Users;
import crypto.demo.dto.LoginRequestDTO;
import crypto.demo.dto.LoginResponseDTO;
import crypto.demo.dto.SignupRequestDTO;
import crypto.demo.repository.UsersRepository;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder; // 비밀번호 해시

    private static final BigDecimal INITIAL_BALANCE =
            BigDecimal.valueOf(10_000_000);

    // ===============================
    // 회원가입
    // ===============================
    @Transactional
    public void signup(SignupRequestDTO dto) {

        if (usersRepository.existsByLoginId(dto.getLoginId())) {
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }
        if (usersRepository.existsByPhone(dto.getPhone())) {
            throw new IllegalArgumentException("이미 사용중인 전화번호입니다.");
        }

        Users user = new Users();
        user.setLoginId(dto.getLoginId());
        // 🔑 해시로 변환 후 저장
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPassword(hashedPassword); // 나중에 BCrypt로 암호화 가능 (해시)
        user.setEmail(dto.getEmail());
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());

        // 🟢 birthdate 확인
        user.setBirthdate(dto.getBirthdate());

        user.setAgreeService(dto.getAgreeService());
        user.setAgreePrivacy(dto.getAgreePrivacy());

        user.setBalance(INITIAL_BALANCE);

        usersRepository.save(user); // 🔥 꼭 @Transactional 안에서 save해야 함
    }


    // ===============================
    // 로그인
    // ===============================
public LoginResponseDTO login(LoginRequestDTO dto) {

    System.out.println("===== 로그인 시도 =====");
    System.out.println("입력 loginId: " + dto.getLoginId());
    System.out.println("입력 password: " + dto.getPassword());

    Users user = usersRepository.findByLoginId(dto.getLoginId())
        .orElseThrow(() -> {
            System.out.println("❌ 아이디 없음");
            return new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        });

    System.out.println("DB 저장 password: " + user.getPassword());

    // boolean match = passwordEncoder.matches(
    //     dto.getPassword(),
    //     user.getPassword()
    // );

    //boolean match = dto.getPassword().equals(user.getPassword());
    boolean match = passwordEncoder.matches(dto.getPassword(), user.getPassword()); //해시 적용


    System.out.println("비밀번호 일치 여부: " + match);

    if (!match) {
        System.out.println("❌ 비밀번호 불일치");
        throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
    }

    System.out.println("✅ 로그인 성공: " + user.getLoginId());

    return new LoginResponseDTO(
        user.getUserid(),
        user.getLoginId(),
        user.getRealName(),
        user.getBalance()
    );
}


    // ===============================
    // 중복 체크
    // ===============================
    public boolean isLoginIdAvailable(String loginId) {
        return !usersRepository.existsByLoginId(loginId);
    }

    public boolean isEmailAvailable(String email) {
        return !usersRepository.existsByEmail(email);
    }

    
}