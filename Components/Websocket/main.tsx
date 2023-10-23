// websocket을 함수로 ? 생각해보기
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import dgram from 'react-native-udp';
import { DeviceDataType, useAuth } from '../../Navigation/AuthContext';

const UDP_PORT = 12345;

const WebSocketComponent = () => {
    
    const { fetchedWData, setFetchedWData } = useAuth();
    
    useEffect(() => {
        const socket = dgram.createSocket({type:'udp4'});
        socket.bind(UDP_PORT);
    
        socket.once('listening', () => {
          console.log(`Listening on port ${UDP_PORT}`);
        });
    
        socket.on('message', (msg, rinfo) => {
          const buoyCount = msg[1];
          const buoys:DeviceDataType[] = [];
      
          for (let i = 0; i < buoyCount; i++) {
              const offset = 2 + i * 20;

              // Year
              const year = (msg[offset + 12] & 0b11111100) >> 2;
              const fullYear = 2000 + year;

              // Month
              const month = ((msg[offset + 12] & 0b00000011) << 2) | ((msg[offset + 13] & 0b11000000) >> 6);

              // Day
              const day = (msg[offset + 13] & 0b00111110) >> 1;

              // Seconds
              const secondsFromUDP = ((msg[offset + 13] & 0b00000001) << 16) | (msg[offset + 14] << 8) | msg[offset + 15];
              const hours = Math.floor(secondsFromUDP / 3600);
              const minutes = Math.floor((secondsFromUDP % 3600) / 60);
              const seconds = secondsFromUDP % 60;

              console.log(`Time Generation: ${fullYear}-${month}-${day} ${hours}:${minutes}:${seconds}`);
      
              // ID
              const buoy_id = msg.slice(offset, offset + 4).toString('hex').toUpperCase();
      
              // Location
              const latitude = +((msg.readInt32BE(offset + 4) / 10000000) * (msg[offset + 4] & 0x80 ? -1 : 1)).toFixed(7);
              const longitude = +((msg.readInt32BE(offset + 8) / 10000000) * (msg[offset + 8] & 0x80 ? -1 : 1)).toFixed(7);
      
              // Status
              const status = msg.slice(offset + 16, offset + 20).toString('hex').toUpperCase();
      
              const buoy: DeviceDataType = {
                  buoy_id,
                  location: { latitude, longitude },
                  time_generation: {
                      year:year,
                      month:month,
                      day:day,
                      hours:hours,
                      minutes:minutes,
                      seconds:seconds
                  },
                  status
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
              <Text>ID: {buoy.buoy_id}</Text>
              <Text>Location: {buoy.location.latitude}N, {buoy.location.longitude}E</Text>
              <Text>Date: {buoy.time_generation.year}-{buoy.time_generation.month}-{buoy.time_generation.day}-{buoy.time_generation.hours}:{buoy.time_generation.minutes}:{buoy.time_generation.seconds}</Text>
              <Text>DateTime: {buoy.time_generation.time}</Text>
              <Text>Status: {buoy.status}</Text>
            </View>
          ))}
        </View>
    );
};

export default WebSocketComponent;
