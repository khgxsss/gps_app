import React, { useState, useEffect } from 'react';
import { Button, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import NaverMapView, { Marker, Polyline } from 'react-native-nmap';
import Geolocation from 'react-native-geolocation-service';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native/Libraries/Components/ScrollView/ScrollView';

type LocationType = {
    latitude?: number;
    longitude?: number;
};

type DeviceData = {
    deviceid: string;
    location: LocationType;
};

const MapComponent = ({ mapType, setMapType, MAP_TYPE, patchedData }: { mapType:any, setMapType:any, MAP_TYPE:object, patchedData:DeviceData[] }) => {
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
            // 사용자 빨간 원 현위치
            <Marker coordinate={location} width={25} height={25}>
                <Icon_MC name="circle-slice-8" size={25} color="red" />
            </Marker>
        );
    }

    const renderDeviceMarkers = () => {
        if (!patchedData || patchedData.length === 0) return null;

        return patchedData.map((device: DeviceData) => (
            <Marker key={device.deviceid} coordinate={device.location} width={35} height={35} >
                <View style={styles.markerContainer}>
                    <Icon_MC name="flag" size={35} color="blue" />
                    <Text style={styles.deviceIdText}>{device.deviceid}</Text>
                </View>
            </Marker>
        ));
    };

    const renderDistanceLines = () => {
        if (!location || !patchedData) return null;
    
        const userLat = location.latitude!;
        const userLon = location.longitude!;
    
        return patchedData.map((device: DeviceData) => {
            const deviceLat = device.location.latitude!;
            const deviceLon = device.location.longitude!;
            const distance = calculateDistance(userLat, userLon, deviceLat, deviceLon);
    
            if (distance <= 3) {  // If distance is less than or equal to 3 km
                return (
                    <Polyline
                        key={`line_${device.deviceid}`}
                        coordinates={[location, device.location]}
                        strokeWidth={5}
                        strokeColor="red"/>
                );
            }
            return null;
        });
    };

    const renderDistanceMarkers = () => {
        if (!location || !patchedData) return null;
    
        const userLat = location.latitude!;
        const userLon = location.longitude!;
    
        return patchedData.map((device: DeviceData) => {
            const deviceLat = device.location.latitude!;
            const deviceLon = device.location.longitude!;
            const distance = calculateDistance(userLat, userLon, deviceLat, deviceLon);
    
            if (distance <= 3) {  // If distance is less than or equal to 3 km
                // Calculate the midpoint between user and device
                const midLat = (userLat + deviceLat) / 2;
                const midLon = (userLon + deviceLon) / 2;
    
                return (
                    <Marker 
                        key={`distance_${device.deviceid}`}
                        coordinate={{latitude: midLat, longitude: midLon}}
                        anchor={{ x: 0.5, y: 0.5 }}
                        width={35} height={35}
                    >
                        <View style={styles.distanceContainer}>
                            <Text style={styles.distanceText}>{`${distance.toFixed(3)*1000} m`}</Text>
                        </View>
                    </Marker>
                );
            }
            return null;
        });
    };

    return (
        <View style={styles.allContainer}>
            <NaverMapView 
                showsMyLocationButton={false}
                mapType={mapType}
                style={{ height:"93.5%" }}
                center={{ ...location, zoom: 13 }}
                onTouch={handleTouch}
            >
                {renderUserMarker()}
                {renderDeviceMarkers()}
                {renderDistanceLines()}
                {renderDistanceMarkers()}
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
        </View>
    );
};
const styles = StyleSheet.create({
    allContainer: {
        height:'100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10
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
    },
    markerContainer: {
        alignItems: 'center'
    },
    deviceIdText: {
        fontSize: 10,
        color: 'blue'
    },
    distanceContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 2,
        borderRadius: 3,
        borderColor: 'gray',
        borderWidth: 0.5,
    },
    distanceText: {
        fontSize: 10,
        color: 'black'
    }
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};



export default MapComponent;
