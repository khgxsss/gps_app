// websocket을 함수로 ? 생각해보기
import React, { useState, useEffect } from 'react';

// JSON Data 오는 형식 가정  
const test_data = [{ deviceid: "40ca63fffe1deca5", location: { latitude: 36.4381755, longitude: 127.4128978 } },{ deviceid: "40ca63fffe1deca6", location: { latitude: 36.4381753, longitude: 127.4128976 } }]

const WebSocketComponent = ({ setPatchedData }: { setPatchedData: Function }) => {
    
    useEffect(() => {
        // test
        setPatchedData(test_data)
    //     const ws = new WebSocket("ws://yourserver.com/socket"); // 실제 서버의 WebSocket 주소로 변경

    //     ws.onopen = () => {
    //         console.log("Connected to the WebSocket");
    //     };

    //     ws.onmessage = (evt) => {
    //         const message = JSON.parse(evt.data);
    //         if (message.deviceid && message.location) {
    //             // 상위 컴포넌트의 patchedData 상태에 접근
    //             setPatchedData((prevData: any[]) => {
    //                 // 이전 데이터 중에서 같은 deviceid를 가진 항목 찾기
    //                 const existingDataIndex = prevData.findIndex(item => item.deviceid === message.deviceid);

    //                 // 같은 deviceid를 가진 데이터가 없다면 그대로 추가
    //                 if (existingDataIndex === -1) {
    //                     return [...prevData, message];
    //                 }

    //                 // 같은 deviceid를 가진 데이터가 있다면 업데이트
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

    //     return () => ws.close();  // 컴포넌트가 언마운트될 때 WebSocket 연결을 종료
    }, []);
    return (<></>)
};

export default WebSocketComponent;
