package crypto.demo.Service;

import crypto.demo.Entity.Trade;
import crypto.demo.Entity.Users;
import crypto.demo.dto.TradeDTO;
import crypto.demo.dto.BalanceUpdateDTO;
import crypto.demo.dto.PortfolioRequestDTO;
import crypto.demo.dto.TradeCreateDTO;
import crypto.demo.repository.TradeRepository;
import crypto.demo.repository.UsersRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;
    private final UsersRepository usersRepository;
    private final PortfolioService portfolioService;

    // @PostConstruct
    // public void initializePortfolios() {
    //     List<Users> users = usersRepository.findAll();
    //     for (Users user : users) {
    //         List<Trade> trades = tradeRepository.findByUserUseridOrderByTradeTimeDesc(user.getUserid());
    //         for (Trade trade : trades) {
    //             portfolioService.processTrade(new PortfolioRequestDTO(
    //                     user.getUserid(),
    //                     trade.getCryptoName(),
    //                     trade.getCryptoSymbol(),
    //                     trade.getOrderType(),
    //                     trade.getTradePrice(),
    //                     trade.getTradeQuantity()
    //             ));
    //         }
    //     }
    // }
                        

    // ===============================
    // 로그인 사용자 기준 전체 조회
    // ===============================
    @Transactional
    public List<TradeDTO> getTradesByUserId(Long userId) {
        return tradeRepository.findByUserUseridOrderByTradeTimeDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ===============================
    // Trade 생성 + Users.balance 업데이트
    // ===============================
    @Transactional
    public TradeDTO createTrade(TradeCreateDTO dto) {

        if (dto.getTradePrice() == null || dto.getTradeQuantity() == null) {
            throw new IllegalArgumentException("가격 또는 수량이 없습니다.");
        }

        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        BigDecimal totalPrice =
                dto.getTradePrice().multiply(dto.getTradeQuantity());

        // -------------------
        // 💰 Users.balance 업데이트
        // -------------------
        if (dto.getOrderType().equalsIgnoreCase("매수")) {
            if (user.getBalance().compareTo(totalPrice) < 0) {
                throw new IllegalArgumentException("잔액이 부족합니다.");
            }
            user.setBalance(user.getBalance().subtract(totalPrice));
        } else if (dto.getOrderType().equalsIgnoreCase("매도")) {
            user.setBalance(user.getBalance().add(totalPrice));
        } else {
            throw new IllegalArgumentException("유효하지 않은 주문 타입입니다.");
        }
        usersRepository.save(user);

        // -------------------
        // Trade 엔티티 생성
        // -------------------
        Trade trade = new Trade();
        trade.setUser(user);
        trade.setCryptoName(dto.getCryptoName());
        trade.setCryptoSymbol(dto.getCryptoSymbol());
        trade.setOrderType(dto.getOrderType().toUpperCase()); // 매수/매도
        trade.setTradePrice(dto.getTradePrice());
        trade.setTradeQuantity(dto.getTradeQuantity());
        trade.setTotalPrice(totalPrice);
        trade.setTradeTime(LocalDateTime.now());

        Trade saved = tradeRepository.save(trade);

        // -------------------
        // Portfolio 업데이트
        // -------------------
        portfolioService.processTrade(new PortfolioRequestDTO(
                dto.getUserId(),
                dto.getCryptoName(),
                dto.getCryptoSymbol(),
                dto.getOrderType(),
                dto.getTradePrice(),
                dto.getTradeQuantity()
        ));

        return convertToDto(saved);
    }

    // ===============================
    // Entity -> DTO 변환
    // ===============================
    private TradeDTO convertToDto(Trade trade) {
        return TradeDTO.builder()
                .simulId(trade.getSimulId())
                .userId(trade.getUser() != null ? trade.getUser().getUserid() : null)
                .loginId(trade.getUser() != null ? trade.getUser().getLoginId() : null)
                .cryptoName(trade.getCryptoName())
                .cryptoSymbol(trade.getCryptoSymbol())
                .orderType(trade.getOrderType())
                .tradePrice(trade.getTradePrice())
                .tradeQuantity(trade.getTradeQuantity())
                .totalPrice(trade.getTotalPrice())
                .tradeTime(trade.getTradeTime())
                .build();
    }

    //잔액조회
    @Transactional(readOnly = true)
    public BalanceUpdateDTO getUserBalance(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        BalanceUpdateDTO dto = new BalanceUpdateDTO();
        dto.setUserId(user.getUserid());  // userId 추가
        dto.setBalance(user.getBalance());
        return dto;
    }
}
