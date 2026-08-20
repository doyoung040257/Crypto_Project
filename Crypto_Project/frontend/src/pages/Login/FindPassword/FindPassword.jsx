import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./FindPassword.module.css";

export default function FindPassword() {
    // 1. 상태 변수명을 백엔드 DTO와 일치하도록 수정 (userId -> loginId, nameKr -> realName)
    const [info, setInfo] = useState({ 
        loginId: '', 
        realName: '', 
        phone: '' 
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // 2. 서버로 본인 확인 요청 (POST 방식 권장)
            const response = await fetch('http://localhost:8080/auth/findpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginId: info.loginId,
                    realName: info.realName,
                    phone: info.phone
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                // 서버에서 해당 유저의 고유 식별자(userId 등)를 보내준다고 가정
                alert(`✅ 본인 확인이 완료되었습니다. 비밀번호 재설정 페이지로 이동합니다.`);
                
                // 3. 비밀번호 재설정 페이지로 이동 (유저 정보를 state에 담아서 전달)
                navigate('/resetpassword', { state: { userId: data.userId } });
            } else {
                setMessage('❌ 입력하신 정보와 일치하는 회원이 없습니다. 정보를 다시 확인해주세요.');
            }
        } catch (error) {
            console.error('오류 발생:', error);
            setMessage('⚠️ 서버 통신 오류가 발생했습니다. 백엔드 서버 상태를 확인하세요.');
        }
    };



    return (
        <div className={styles.findPage}>
            <div className={styles.container}>
                <h2 className={styles.title}>비밀번호 찾기</h2>
                <p className={styles.description}>가입 시 입력한 정보를 입력하여 본인 인증을 진행해 주세요.</p>
                
                <form onSubmit={handleSearch} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>아이디</label>
                        <input 
                            type="text" 
                            placeholder="아이디를 입력하세요" 
                            value={info.loginId}
                            onChange={(e) => setInfo({...info, loginId: e.target.value})}
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>이름</label>
                        <input 
                            type="text" 
                            placeholder="이름을 입력하세요" 
                            value={info.realName}
                            onChange={(e) => setInfo({...info, realName: e.target.value})}
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>전화번호</label>
                        <input 
                            type="text" 
                            placeholder="010-0000-0000" 
                            value={info.phone}
                            onChange={(e) => setInfo({...info, phone: e.target.value})}
                            required 
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} onClick={() => handleSearch}>인증하기</button>                
                </form>

                {message && <p className={styles.message}>{message}</p>}
                
                <button onClick={() => navigate('/login')} className={styles.backBtn}>
                    로그인 페이지로 돌아가기
                </button>
            </div>
        </div>
    );
}