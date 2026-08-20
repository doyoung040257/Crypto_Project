package crypto.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Portfolio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @EmbeddedId
    private PortfolioId id;

    @MapsId("userId")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "crypto_name", nullable = false, length = 20)
    private String cryptoName;

    @Column(name = "buy_price", nullable = false, precision = 20, scale = 2)
    private BigDecimal buyPrice;      // 총 매수금액

    @Column(name = "average_price", nullable = false, precision = 20, scale = 2)
    private BigDecimal averagePrice;  // 평균 매수가

    @Column(name = "quantity", nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(name = "updated_date", nullable = false)
    private LocalDateTime updatedDate;

    @PrePersist
    void onCreate() {
        this.updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}
