package crypto.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import crypto.demo.dto.RankingDto;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class RankingController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/rankings")
    public Map<String, Object> getRankings(@RequestParam(name = "criteria", value = "criteria", defaultValue = "asset") String criteria) {
        
        // 1. 정렬 기준 설정: NULL 값(미투자자)도 정확한 위치에 오도록 NVL 처리 추가
        // 자산순: (현금 + 평가금액) 기준 내림차순
        // 수익률순: 수익률 기준 내림차순 (미투자는 0%로 처리)
        String orderByClause = criteria.equals("profitRate") 
            ? "NVL(tp.totalRate, 0) DESC" 
            : "(u.balance + NVL(tp.totalEvaluation, 0)) DESC";

        // 2. SQL 쿼리: LEFT JOIN을 유지하여 totalportfolio에 레코드가 없는 본인도 포함
        String sql = "SELECT " +
                    "    RANK() OVER (ORDER BY " + orderByClause + ") AS ranking_position, " +
                    "    u.user_id AS id, " +
                    "    u.real_name AS name, " +
                    "    (u.balance + NVL(tp.totalEvaluation, 0)) AS asset, " +
                    "    NVL(tp.totalRate, 0) AS profitRate " +
                    "FROM USERS u " +
                    "LEFT JOIN totalportfolio tp ON u.user_id = tp.user_id " +
                    "ORDER BY ranking_position";

    List<RankingDto> rankings = jdbcTemplate.query(sql, (rs, rowNum) ->
            new RankingDto(
                    rs.getInt("ranking_position"),
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getDouble("asset"),
                    rs.getDouble("profitRate")
            )
    );

    Map<String, Object> response = new HashMap<>();
    response.put("rankings", rankings);
    return response;
    }
}