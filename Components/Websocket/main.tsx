// websocket�� �Լ��� ? �����غ���
import React, { useState, useEffect } from 'react';

// JSON Data ���� ���� ����  
const test_data = [{ deviceid: "40ca63fffe1deca5", location: { latitude: 36.4381755, longitude: 127.4128978 } },{ deviceid: "40ca63fffe1deca6", location: { latitude: 36.4381753, longitude: 127.4128976 } }]

const WebSocketComponent = ({ setPatchedData }: { setPatchedData: Function }) => {
    
    useEffect(() => {
        // test
        setPatchedData(test_data)
    //     const ws = new WebSocket("ws://yourserver.com/socket"); // ���� ������ WebSocket �ּҷ� ����

    //     ws.onopen = () => {
    //         console.log("Connected to the WebSocket");
    //     };

    //     ws.onmessage = (evt) => {
    //         const message = JSON.parse(evt.data);
    //         if (message.deviceid && message.location) {
    //             // ���� ������Ʈ�� patchedData ���¿� ����
    //             setPatchedData((prevData: any[]) => {
    //                 // ���� ������ �߿��� ���� deviceid�� ���� �׸� ã��
    //                 const existingDataIndex = prevData.findIndex(item => item.deviceid === message.deviceid);

    //                 // ���� deviceid�� ���� �����Ͱ� ���ٸ� �״�� �߰�
    //                 if (existingDataIndex === -1) {
    //                     return [...prevData, message];
    //                 }

    //                 // ���� deviceid�� ���� �����Ͱ� �ִٸ� ������Ʈ
    //                 const updatedData = [...prevData];
    //                 updatedData[existingDataIndex] = message;
    //                 return updatedData;
    //             });
    //         }
    //     };

    //     ws.onerror = (error) => {
    //         console.error("WebSocket Error: ", error);
    //     };

    //     ws.onclose = (event) => {
    //         if (event.wasClean) {
    //             console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
    //         } else {
    //             console.warn('Connection died');
    //         }
    //     };

    //     return () => ws.close();  // ������Ʈ�� �𸶿�Ʈ�� �� WebSocket ������ ����
    }, []);
    return (<></>)
};

export default WebSocketComponent;
