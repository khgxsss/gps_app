// websocket을 함수로 ? 생각해보기
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import dgram from 'react-native-udp';
import { useAuth } from '../../Navigation/AuthContext';

const UDP_PORT = 12345;

// JSON Data 오는 형식 가정  

const twoMinutesInMillis = 10000; // 2분을 밀리초로 표현

const WebSocketComponent = () => {
    
    const { fetchedWData, setFetchedWData } = useAuth();
    
    useEffect(() => {
        const socket = dgram.createSocket('udp4');
        socket.bind(UDP_PORT);
    
        socket.once('listening', () => {
          console.log(`Listening on port ${UDP_PORT}`);
        });
    
        socket.on('message', (msg, rinfo) => {
          // 데이터 수신 및 처리
          const buoyCount = msg[1];
          const buoys = [];
          for (let i = 0; i < buoyCount; i++) {
            const offset = 2 + i * 20;
            const buoy = {
              id: msg.slice(offset, offset + 4).toString('hex').toUpperCase(),
              latitude: ((msg.readInt32BE(offset + 4) / 10000000) * (msg[offset + 4] & 0x80 ? -1 : 1)).toFixed(7),
              longitude: ((msg.readInt32BE(offset + 8) / 10000000) * (msg[offset + 8] & 0x80 ? -1 : 1)).toFixed(7),
              year: 2000 + msg[offset + 12],
              month: msg[offset + 13],
              day: msg[offset + 14],
              time: new Date(0, 0, 0, 0, 0, msg.readInt32BE(offset + 15)).toTimeString().slice(0, 8),
              status: msg.slice(offset + 16, offset + 20).toString('hex').toUpperCase()
            };
            buoys.push(buoy);
          }
          setFetchedWData(buoys);
        });
    
        return () => {
          socket.close();
        };
    }, []);
    
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {fetchedWData && fetchedWData.map((buoy, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text>ID: {buoy.id}</Text>
              <Text>Location: {buoy.latitude}N, {buoy.longitude}E</Text>
              <Text>Date: {buoy.year}-{buoy.month}-{buoy.day} {buoy.time}</Text>
              <Text>Status: {buoy.status}</Text>
            </View>
          ))}
        </View>
    );
};

export default WebSocketComponent;
