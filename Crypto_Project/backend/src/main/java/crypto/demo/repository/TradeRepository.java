package crypto.demo.repository;

import crypto.demo.Entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {

    // 로그인 사용자 기준으로 거래 내역 조회
    List<Trade> findByUserUseridOrderByTradeTimeDesc(Long userId);
    
}
