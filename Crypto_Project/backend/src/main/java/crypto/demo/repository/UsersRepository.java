package crypto.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import crypto.demo.Entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // 비밀번호 찾기(본인 확인)를 위한 커스텀 쿼리 메서드 추가
    Optional<Users> findByLoginIdAndRealNameAndPhone(String loginId, String realName, String phone);
}
