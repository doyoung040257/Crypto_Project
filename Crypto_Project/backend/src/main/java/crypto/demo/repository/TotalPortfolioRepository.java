package crypto.demo.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import crypto.demo.Entity.TotalPortfolio;
import crypto.demo.Entity.Users;

public interface TotalPortfolioRepository extends JpaRepository<TotalPortfolio, Long> {
    Optional<TotalPortfolio> findByUser(Users user); // ✅ 반드시 user 객체
}
