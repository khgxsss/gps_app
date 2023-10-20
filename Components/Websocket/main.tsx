// websocket을 함수로 ? 생각해보기
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Navigation/AuthContext';

// JSON Data 오는 형식 가정  

const twoMinutesInMillis = 10000; // 2분을 밀리초로 표현

const WebSocketComponent = () => {
    
    const { fetchedWData, setFetchedWData } = useAuth();
    
    const updateOnlineStatus = () => {
    
        // fetchedWData의 각 항목을 확인하여 online 상태 업데이트
        const updatedData = fetchedWData.map(device => {
            if (Date.now() - device.receivedtime > twoMinutesInMillis) {
                return {
                    ...device,
                    online: false
                };
            }
            return device;
        });
    
        setFetchedWData(updatedData); // 상태 업데이트
    };

    useEffect(() => {
        const intervalId = setInterval(updateOnlineStatus, 3000);
    
        return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 타이머 제거
    }, [fetchedWData]);
    
    return (<></>)
};

export default WebSocketComponent;
