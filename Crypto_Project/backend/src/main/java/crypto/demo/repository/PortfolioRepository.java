package crypto.demo.repository;

import crypto.demo.Entity.Portfolio;
import crypto.demo.Entity.PortfolioId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, PortfolioId> {

    // Users 엔티티 필드명이 userid이므로 User_Userid 사용
    List<Portfolio> findByUser_Userid(Long userId);

    Optional<Portfolio> findByUser_UseridAndId_CryptoSymbol(Long userId, String cryptoSymbol);

    // 매수 처리
    @Modifying
    @Transactional
    @Query("UPDATE Portfolio p SET p.quantity = p.quantity + :tradeQuantity, " +
           "p.buyPrice = p.buyPrice + (:tradePrice * :tradeQuantity), " +
           "p.averagePrice = (p.buyPrice + (:tradePrice * :tradeQuantity)) / (p.quantity + :tradeQuantity), " +
           "p.updatedDate = CURRENT_TIMESTAMP " +
           "WHERE p.user.id = :userId AND p.id.cryptoSymbol = :cryptoSymbol")
    void updateForBuy(@Param("userId") Long userId, 
                      @Param("cryptoSymbol") String cryptoSymbol, 
                      @Param("tradePrice") BigDecimal tradePrice, 
                      @Param("tradeQuantity") BigDecimal tradeQuantity);

    // 매도 처리
    @Modifying
    @Transactional
    @Query("UPDATE Portfolio p SET p.quantity = p.quantity - :tradeQuantity, " +
           "p.buyPrice = p.buyPrice - (:tradePrice * :tradeQuantity), " +
           "p.averagePrice = (p.buyPrice - (:tradePrice * :tradeQuantity)) / (p.quantity - :tradeQuantity), " +
           "p.updatedDate = CURRENT_TIMESTAMP " +
           "WHERE p.user.id = :userId AND p.id.cryptoSymbol = :cryptoSymbol")
    void updateForSell(@Param("userId") Long userId, 
                       @Param("cryptoSymbol") String cryptoSymbol, 
                       @Param("tradePrice") BigDecimal tradePrice, 
                       @Param("tradeQuantity") BigDecimal tradeQuantity);

}
