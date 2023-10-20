// websocket�� �Լ��� ? �����غ���
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Navigation/AuthContext';

// JSON Data ���� ���� ����  

const twoMinutesInMillis = 10000; // 2���� �и��ʷ� ǥ��

const WebSocketComponent = () => {
    
    const { fetchedWData, setFetchedWData } = useAuth();
    
    const updateOnlineStatus = () => {
    
        // fetchedWData�� �� �׸��� Ȯ���Ͽ� online ���� ������Ʈ
        const updatedData = fetchedWData.map(device => {
            if (Date.now() - device.receivedtime > twoMinutesInMillis) {
                return {
                    ...device,
                    online: false
                };
            }
            return device;
        });
    
        setFetchedWData(updatedData); // ���� ������Ʈ
    };

    useEffect(() => {
        const intervalId = setInterval(updateOnlineStatus, 3000);
    
        return () => clearInterval(intervalId); // ������Ʈ�� �𸶿�Ʈ�� �� Ÿ�̸� ����
    }, [fetchedWData]);
    
    return (<></>)
};

export default WebSocketComponent;
