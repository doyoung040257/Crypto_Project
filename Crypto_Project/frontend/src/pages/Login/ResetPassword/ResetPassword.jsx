import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../Login.module.css'; // 기존 로그인 스타일 공유

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    
    // FindPassword 페이지에서 넘겨준 유저의 고유 ID
    const userIdInDb = location.state?.userId;
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!userIdInDb) {
            alert("잘못된 접근입니다. 본인 인증을 다시 진행해 주세요.");
            navigate('/findpassword');
            return;
        }

        try { //백엔드 스프링 부트 주소(8080)와 우리가 만든 컨트롤러 경로로 변
            // json-server의 특정 항목을 수정하기 위해 PATCH 사용
            const response = await fetch(`http://localhost:8080/auth/resetpassword`, {
                method: 'POST', // 스프링 컨트롤러에서 @PostMapping으로 만들었습니다.
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: userIdInDb, // DTO 구조에 맞게 전달
                    newPassword: newPassword 
                })
            });

            if (response.ok) {
                alert("비밀번호가 성공적으로 변경되었습니다! 다시 로그인해 주세요.");
                navigate('/login');
            }
        } catch (error) {
            alert("변경 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>비밀번호 재설정</h1>
                <p className={styles.subtitle}>새로운 비밀번호를 입력해 주세요.</p>
                <form onSubmit={handleUpdate} className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label>새 비밀번호</label>
                        <input 
                            type="password" 
                            placeholder="8자 이상 입력" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className={styles.loginBtn}>변경 완료</button>
                </form>
            </div>
        </div>
    );
}