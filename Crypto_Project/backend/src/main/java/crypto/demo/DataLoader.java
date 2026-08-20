package crypto.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import crypto.demo.repository.TradeRepository;

@Component
public class DataLoader implements CommandLineRunner {

    private final TradeRepository tradeRepository; // 변경된 리포지토리 타입과 필드 이름

    public DataLoader(TradeRepository tradeRepository) { // 변경된 생성자 파라미터
        this.tradeRepository = tradeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- Oracle DB 연결 테스트 시작 ---");

        // DB에 직접 INSERT한 데이터와 충돌할 수 있으니 기존 데이터는 삭제하고 진행하거나,
        // 시퀀스가 잘 동작하는지 확인하는 용도로 새로운 ID를 사용해야 합니다.
        // JPA는 @GeneratedValue 설정에 따라 시퀀스에서 다음 ID를 가져와 사용합니다.

        // 1. 새로운 데이터 저장
        // Trade newTrade1 = new Trade(null, "Bitcoin", "BTC", "buy",
        //                              new BigDecimal("98765.4321"), // BigDecimal은 문자열로 초기화하는 것이 정확합니다.
        //                              new BigDecimal("0.5"),
        //                              new BigDecimal("49382.71605"),
        //                              LocalDateTime.now());
        // Trade savedTrade1 = tradeRepository.save(newTrade1);
        // System.out.println("저장된 주문내역: " + savedTrade1); // @ToString으로 실제 값 출력

        // 2. 모든 Trade 데이터 조회
        // List<Trade> allTrades = tradeRepository.findAll();
        // System.out.println("\n--- 모든 주문내역 (Trade toString 출력) ---");
        // allTrades.forEach(trade -> System.out.println(trade.toString()));

        // 3. 특정 Trade 조회 (예시: cryptoName = "Bitcoin")
        // List<Trade> bitcoinTrades = tradeRepository.findByCryptoName("Bitcoin");
        // System.out.println("\n--- 'Bitcoin'으로 조회된 주문내역 (Trade toString 출력) ---");
        // bitcoinTrades.forEach(trade -> System.out.println(trade.toString()));

        // 4. 모든 Crypto 데이터 조회
        // List<Crypto> allCryptos = cryptoRepository.findAll();
        // System.out.println("\n--- 모든 코인정보 (Crypto toString 출력) ---");
        // allCryptos.forEach(crypto -> System.out.println(crypto.toString()));

        System.out.println("\n--- Oracle DB 연결 테스트 완료 ---");
    }
}