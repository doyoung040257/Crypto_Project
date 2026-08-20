package crypto.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import crypto.demo.converter.BooleanToYNConverter;

@Entity
@Table(name = "USERS")
@Getter @Setter
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userid;

    @Column(name = "LOGIN_ID", nullable = false, unique = true)
    private String loginId;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "EMAIL", nullable = false, unique = true)
    private String email;

    @Column(name = "REAL_NAME", nullable = false)
    private String realName;

    @Column(name = "PHONE", nullable = false, unique = true)
    private String phone;

    @Column(name = "BIRTHDATE", nullable = false)
    private LocalDate birthdate;

    @Column(name = "BALANCE", nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    // 🔥 Y/N ↔ Boolean 자동 변환
    @Convert(converter = BooleanToYNConverter.class)
    @Column(name = "AGREE_SERVICE", nullable = false)
    private Boolean agreeService;

    @Convert(converter = BooleanToYNConverter.class)
    @Column(name = "AGREE_PRIVACY", nullable = false)
    private Boolean agreePrivacy;

    @Column(name = "CREATED_DATE", updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}

