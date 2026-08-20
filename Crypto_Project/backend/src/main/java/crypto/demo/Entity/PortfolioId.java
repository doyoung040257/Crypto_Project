package crypto.demo.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;


@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class PortfolioId implements Serializable {
    
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "CRYPTO_SYMBOL")
    private String cryptoSymbol;

    public PortfolioId() {}

    public PortfolioId(Long userId, String cryptoSymbol) {
        this.userId = userId;
        this.cryptoSymbol = cryptoSymbol;
    }
}
