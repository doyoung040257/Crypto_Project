package crypto.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewsDTO {

    private int publishedOn;
    private String imageUrl;
    private String title;
    private String subtitle;
    private String authors;
    private int sourceId;
    private String url;
    private String body;
    private String keywords;
}
