import { useEffect, useState } from "react";
import styles from "../Main.module.css";

export default function NewsSection(){

    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/news")
        .then(res => res.json())
        .then(data => setNewsList(data))
        .catch(err => console.error("뉴스 불러오기 실패:", err));

        const interval = setInterval(() => {
            window.location.reload();
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    return(
        <div>
            <div className={styles.sectionTitle}><label>암호화폐 뉴스</label></div>
            <div className={styles.newsList}>
                    {newsList && newsList.length > 0 ? (
                        newsList.slice(0,5).map((news, idx) => (
                            <div className={styles.newsItem} key={idx}>
                                <img src={news.imageUrl} alt="뉴스이미지" className={styles.newsImage}/>
                                <p><a href={news.url} target="_blank">{news.title}</a></p>

                            </div>

                        ))
                    )
                    :
                    <p>뉴스 목록이 없습니다.</p>
            }
            </div>
        </div>
    )
}