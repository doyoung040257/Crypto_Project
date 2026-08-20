package crypto.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRADES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SIMUL_ID", updatable = false)
    private Long simulId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private Users user;

    @Column(name = "CRYPTO_NAME", nullable = false, length = 20)
    private String cryptoName;

    @Column(name = "CRYPTO_SYMBOL", nullable = false, length = 20)
    private String cryptoSymbol;

    @Column(name = "ORDER_TYPE", nullable = false, length = 20)
    private String orderType;

    @Column(name = "TRADE_PRICE", nullable = false, precision = 20, scale = 2)
    private BigDecimal tradePrice;

    @Column(name = "TRADE_QUANTITY", nullable = false, precision = 20, scale = 2)
    private BigDecimal tradeQuantity;

    @Column(name = "TOTAL_PRICE", nullable = false, precision = 20, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "TRADE_TIME", nullable = false)
    private LocalDateTime tradeTime;
}
