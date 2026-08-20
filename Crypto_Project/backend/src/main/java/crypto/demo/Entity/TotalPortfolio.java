package crypto.demo.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TOTALPORTFOLIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalPortfolio {

    @Id
    @Column(name = "USER_ID")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId   // ⭐ PK를 Users의 PK와 공유
    @JoinColumn(name = "USER_ID")
    private Users user;

    @Column(name = "TOTALINVESTED", nullable = false)
    private BigDecimal totalInvested;

    @Column(name = "TOTALEVALUATION", nullable = false)
    private BigDecimal totalEvaluation;

    @Column(name = "TOTALPROFIT", nullable = false)
    private BigDecimal totalProfit;

    @Column(name = "TOTALRATE", nullable = false)
    private BigDecimal totalRate;
}


