import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import dgram from 'react-native-udp';
import { DeviceDataType, useAuth } from '../../Navigation/AuthContext';

const UDP_PORT = 12345;

const WebSocketComponent = () => {
    
    const { fetchedWData, setFetchedWData } = useAuth();

    const updateData = (newBuoy: DeviceDataType) => {
      setFetchedWData(prevData => {
          if (!prevData) return [newBuoy];
  
          const existingIndex = prevData.findIndex((b: { buoy_id: string; }) => b.buoy_id === newBuoy.buoy_id);
          if (existingIndex !== -1) {
              const existingBuoy = prevData[existingIndex];
              if (newBuoy.time_generation.time > existingBuoy.time_generation.time) {
                  // ���ο� �����Ͱ� �� �ֽ��� ���� ������
                  const updatedData = [...prevData];
                  updatedData[existingIndex] = newBuoy;
                  return updatedData;
              } else {
                  // ���� �����Ͱ� �� �ֽ��̰ų� ���� ��쿡�� �״�� ����
                  return prevData;
              }
          } else {
              return [...prevData, newBuoy];
          }
      });
    };  
    
    useEffect(() => {
        const socket = dgram.createSocket({type:'udp4'});
        socket.bind(UDP_PORT);
    
        socket.once('listening', () => {
          console.log(`Listening on port ${UDP_PORT}`);
        });
    
        socket.on('message', (msg, rinfo) => {
          if (msg.length < 2) {
            console.error("��Ʈ��ũ�� �Ҿ����մϴ�. bouyCount�� �����ϴ�.");
            return;
          }
          const buoyCount = msg[1];
          const expectedMsgLength = 2 + buoyCount * 20; // �⺻ 2����Ʈ + buoyCount�� ���� ���� ����
          // ���� �޽��� ���̿� ���� ���̸� ��
          if (msg.length !== expectedMsgLength) {
            console.error("��Ʈ��ũ�� �Ҿ����մϴ�. ����� ������ ���̿� ��ġ���� �ʽ��ϴ�.");
            return;
          }
      
          for (let i = 0; i < buoyCount; i++) {
            const offset = 2 + i * 20;
    
            // ID
            const buoy_id = msg.slice(offset, offset + 4).toString('hex').toUpperCase();
    
            // Location
            const latitude = +((msg.readInt32BE(offset + 4) / 10000000) * (msg[offset + 4] & 0x80 ? -1 : 1)).toFixed(7);
            const longitude = +((msg.readInt32BE(offset + 8) / 10000000) * (msg[offset + 8] & 0x80 ? -1 : 1)).toFixed(7);

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

            // Create Date object and convert it to milliseconds
            const dateObj = new Date(fullYear, month - 1, day, hours, minutes, seconds);
            const timeInMilliseconds = dateObj.getTime();

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
                    seconds:seconds,
                    time: timeInMilliseconds
                },
                status
            };
            updateData(buoy)
          }
        });
        return () => {
          socket.close();
        };
    }, []);
    
    return (
        <></>
    );
};

export default WebSocketComponent;
