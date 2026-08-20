import { useEffect, useState } from "react";

export default function useFetch(url, deps = []){
    const [data, setDatas] = useState(null); // 초기값을 null로 변경하여 데이터 로딩 전 상태를 명확히 합니다.
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [error, setError] = useState(null); // 에러 상태 추가

    useEffect(() => {
        setLoading(true); // 요청 시작 시 로딩 상태 true
        setError(null);   // 에러 상태 초기화

        fetch(url)
        .then(res => {
            if (!res.ok) { // HTTP 상태 코드가 200번대가 아니면 에러 처리
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            setDatas(data);
            setLoading(false); // 데이터 로드 완료 후 로딩 상태 false
        })
        .catch(err => {
            setError(err); // 에러 발생 시 에러 상태 저장
            setLoading(false); // 에러 발생 시에도 로딩 상태 false
            console.error("useFetch 에러:", err);
        });
    }, [url, ...deps]); // 의존성 배열에 url과 추가적인 deps 포함

    // 로딩, 에러 상태도 함께 반환하여 컴포넌트에서 활용할 수 있도록 합니다.
    return data; // 이 예제에서는 data만 반환하지만, 실제 앱에서는 { data, loading, error } 객체를 반환하는 것이 더 좋습니다.
}