package crypto.demo.Service;

import crypto.demo.Entity.Users; 
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import crypto.demo.dto.PasswordDTO;
import crypto.demo.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordService {

    // 기존에 사용하던 레퍼지토리를 주입
    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder; // 암호화 주입

    public Long findUserForReset(PasswordDTO.FindRequest dto) {
        return usersRepository.findByLoginIdAndRealNameAndPhone(
            dto.getLoginId(), dto.getRealName(), dto.getPhone()
        ).orElseThrow(() -> new RuntimeException("일치하는 회원이 없습니다."))
         .getUserid(); 
    }

    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        // 기존 레퍼지토리로 사용자 조회
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 암호화 후 변경
        user.setPassword(passwordEncoder.encode(newPassword));
    }
}