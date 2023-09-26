import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import NaverMapView, { Marker } from 'react-native-nmap';
import Geolocation from 'react-native-geolocation-service';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons'

type LocationType = {
    latitude?: number;
    longitude?: number;
};

const MapComponent = () => {
    const [location, setLocation] = useState<LocationType>({ latitude: 37.35882350130591, longitude: 127.10469231924353 });
    const [lastTouchTime, setLastTouchTime] = useState<number | null>(null);

    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;

                // 사용자가 마지막으로 지도를 터치한 시점에서 2초가 지나지 않았다면 위치를 업데이트 하지 않는다.
                if (lastTouchTime && Date.now() - lastTouchTime < 2000) {
                    return;
                }

                setLocation({ latitude, longitude });
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
        };
    }, [lastTouchTime]);

    const handleTouch = () => {
        // 사용자가 지도를 터치할 때마다 현재 시간을 저장한다.
        setLastTouchTime(Date.now());
    }

    const renderUserMarker = () => {
        if (!location) return <></>;
        return (
            <Marker coordinate={location} width={30} height={30}>
                <Icon_MC name="circle-slice-8" size={30} color="red" />
            </Marker>
        );
    }

    return (
        <NaverMapView 
            showsMyLocationButton={false} 
            style={{ width: '100%', height: '100%' }} 
            center={{ ...location, zoom: 16 }}
            onTouch={handleTouch}>
            {renderUserMarker()}
        </NaverMapView>
    );
};

// svg icon if necessary
const xml:string = `
    <svg viewBox="0 0 500 500">
    <path d="M 240.018 229.275 C 293.492 229.275 336.741 272.524 336.741 325.998 C 336.741 379.472 293.492 422.721 240.018 422.721 C 186.544 422.721 143.295 379.472 143.295 325.998 C 143.295 272.524 186.544 229.275 240.018 229.275 M 240.018 187.822 C 316.015 187.822 378.194 250.001 378.194 325.998 C 378.194 401.995 316.015 464.174 240.018 464.174 C 164.021 464.174 101.842 401.995 101.842 325.998 C 101.842 250.001 164.021 187.822 240.018 187.822 M 240.018 215.457 C 178.944 215.457 129.477 264.924 129.477 325.998 C 129.477 387.072 178.944 436.539 240.018 436.539 C 301.092 436.539 350.559 387.072 350.559 325.998 C 350.559 264.924 301.092 215.457 240.018 215.457 Z" style="fill: rgb(255, 0, 0);" transform="matrix(1, 0, 0, 1, 0, 3.552713678800501e-15)"/>
    <path d="M 231.601 31.968 Q 241.832 14.357 252.064 31.968 L 324.614 156.844 Q 334.845 174.455 314.382 174.455 L 169.283 174.455 Q 148.82 174.455 159.051 156.844 Z" style="fill: rgb(255, 0, 0); stroke: rgb(255, 255, 255);" transform="matrix(1, 0, 0, 1, 0, 3.552713678800501e-15)" bx:shape="triangle 148.82 14.357 186.025 160.098 0.5 0.11 1@449cc694"/>
    </svg>
`

export default MapComponent;
