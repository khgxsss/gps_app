import React, { useState, useEffect } from 'react';
import {Text} from 'react-native';
import NaverMapView, { Marker } from 'react-native-nmap';
import Geolocation from 'react-native-geolocation-service';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons';
import { magnetometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const MapComponent = () => {
    const [location, setLocation] = useState(null);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        // 센서 업데이트 간격 설정
        setUpdateIntervalForType(SensorTypes.magnetometer, 1000); // 1000ms

        const subscription = magnetometer.subscribe(({ x, y }) => {
            // atan2를 사용하여 회전 각도를 계산합니다.
            const rad = Math.atan2(y, x);
            const deg = rad * (180 / Math.PI);
            setRotation(deg);
        });
  
        const watchId = Geolocation.watchPosition(
          position => {
              const { latitude, longitude, heading } = position.coords;
              
              setLocation({
                latitude,
                longitude,
                heading
              });
          },
          error => {
              console.log(error);
          },
          {
              enableHighAccuracy: true,
              interval: 1000,
              distanceFilter: 0,
              forceRequestLocation: true,
              showLocationDialog: true,
          }
        );

        return () => {
            if (watchId) {
                Geolocation.clearWatch(watchId);
            }
            subscription.unsubscribe();
        };
    }, []);

    const renderUserMarker = () => {
        if (!location) return null;

        return (
          <Marker coordinate={location} width={30} height={30} rotation={location.heading}>
              <Icon_MC name="navigation-outline" size={30} color="red"/>
          </Marker>
        );
    };

    return (
      <NaverMapView style={{ flex: 1 }} center={location || undefined}>
          {renderUserMarker()}
      </NaverMapView>
    );
};

export default MapComponent;
