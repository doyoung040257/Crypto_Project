import { useEffect, useState } from "react";
import styles from "./News.module.css"

export default function News({itemsPerPage = 5, PageNumber = 5}) {

    const [newsList, setNewsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPageNumber, setMaxPageNumber] = useState(PageNumber);
    const [minPageNumber, setMinPageNumber] = useState(1);
    
    useEffect(() => {
        fetch("http://localhost:8080/api/news")
        .then(res => res.json())
        .then(data => setNewsList(data))
        .catch(err => console.error("뉴스 불러오기 실패:", err));
    }, []);


    //페이지 번호
    const totalPage = Math.ceil(newsList.length / itemsPerPage);
    const pages = [];
    for (let i = 1; i <= totalPage; i++){
        pages.push(i);
    }

    //현재 페이지의 뉴스
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = newsList.slice(indexOfFirstItem, indexOfLastItem);

    const handleClick = (page) => setCurrentPage(page);
    

    const handleNext = () => {
        setCurrentPage(currentPage + 1);

        if (currentPage + 1 > maxPageNumber){
            setMaxPageNumber(maxPageNumber + PageNumber)
            setMinPageNumber(minPageNumber + PageNumber)
        }
    }

    const handlePrev = () => {
        setCurrentPage(currentPage - 1);

        if ((currentPage - 1) % PageNumber === 0){
            setMaxPageNumber(maxPageNumber-PageNumber);
            setMinPageNumber(minPageNumber-PageNumber);
        }
    }

    //자세히보기
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (idx) => {
        setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx]}));
    }

    const maxLength = 200;


    return(
        <div className={styles.newsPage}>
            <div className={styles.container}>
                <label className={styles.newstitle}>암호화폐 뉴스</label>
                <div className={styles.newList}>
                    {currentItems.map((news, idx) => {
                        const isExpanded = expandedItems[idx] || false;
                        const isLong = news.body.length > maxLength;
                        const displayedText = isExpanded || !isLong
                            ? news.body
                            : news.body.substring(0, maxLength) + "...";

                        return (
                            <div className={styles.newsItem} key={idx}>
                                <img src={news.imageUrl} alt="뉴스이미지" className={styles.newImage} />
                                <div className={styles.newsContent}>
                                    <a href={news.url} target="_blank"><h2 className={styles.newsHeadline}>{news.title}</h2></a>
                                    <p>{displayedText}
                                    {isLong && (
                                        <label className={styles.readMore} onClick={() => toggleExpand(idx)}>
                                            {isExpanded ? "간략히보기" : "자세히보기"}
                                        </label>
                                    )}
                                    </p>
                                    <a href={news.url} target="_blank"><p className={styles.newsUrl}>{news.url}</p></a>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <ul className={styles.pagination}>
                    <li>
                        <button className={styles.handlePrevBtn} onClick={handlePrev} disabled={currentPage === 1}>이전</button>
                    </li>

                    {pages.map((page) => {
                        if (page >= minPageNumber && page <= maxPageNumber){
                            return (
                                <li key={page}>
                                    <button
                                        className={` ${styles.pageBtn} ${currentPage === page ? styles.active: ""}`}
                                        onClick={() => handleClick(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            );
                        }
                        return null;
                    })}

                    <li>
                        <button className={styles.handleNextBtn} onClick={handleNext} disabled={currentPage === totalPage}>다음</button>
                    </li>
                </ul>
            </div>
        </div>
    )
}