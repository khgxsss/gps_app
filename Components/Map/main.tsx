import React, { useState, useEffect } from 'react';
import { Button, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
    const [mapType, setMapType] = useState(MAP_TYPE.Basic);

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
            <Marker coordinate={location} width={25} height={25}>
                <Icon_MC name="circle-slice-8" size={25} color="red" />
            </Marker>
        );
    }

    return (
        <>
            <NaverMapView 
                showsMyLocationButton={false}
                mapType={mapType}
                style={{ height:"90%" }}
                center={{ ...location, zoom: 16 }}
                onTouch={handleTouch}
            >
                {renderUserMarker()}
            </NaverMapView>
            <View style={styles.buttonContainer}>
                {Object.entries(MAP_TYPE).map(([key, value]) => (
                    <TouchableOpacity 
                        key={key} 
                        style={styles.button}
                        onPress={() => setMapType(value)}
                    >
                        <Text style={styles.buttonText}>{key}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 20
    },
    button: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: '#4285f4',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

const MAP_TYPE = {
    Basic: 0,
    TERRAIN: 4,
    SATELLITE: 2,
    HYBRID: 3,
    NAVI: 1
};


export default MapComponent;
