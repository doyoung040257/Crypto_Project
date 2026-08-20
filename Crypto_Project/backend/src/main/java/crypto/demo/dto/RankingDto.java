package crypto.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RankingDto {
    private int ranking_position;
    private String id;
    private String name;
    private double asset;
    private double profitRate;
}