import React, { useState, useEffect, useMemo } from 'react';
import { Button, View, TouchableOpacity, Text, StyleSheet, Alert, Linking, PermissionsAndroid } from 'react-native';
import NaverMapView, { Coord, Marker, Polyline } from 'react-native-nmap-fork1';
import Geolocation from 'react-native-geolocation-service';
import { Ionicons, MaterialCommunityIcons } from '../../Components/IconSets';
import ActionButton from 'react-native-action-button-fork1';
import IntentLauncher from 'react-native-intent-launcher-fork1';
import { DeviceDataType, Region, useAuth } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';

const MapComponent = () => {
    const [location, setLocation] = useState<Coord>({ latitude: 37.35882350130591, longitude: 127.10469231924353 });
    const [init, setInit] = useState<boolean>(true)
    const [lastTouchTime, setLastTouchTime] = useState<number | null>(null);
    const [region, setRegion] = useState<Region>({"contentRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "coveringRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "latitude": 36.43816920000003, "longitude": 127.41290420000009, "zoom": 16});
    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory } = useAuth();
    
    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                // 사용자가 마지막으로 지도를 터치한 시점에서 2.5초가 지나지 않았다면 위치를 업데이트 하지 않는다.
                if (lastTouchTime && Date.now() - lastTouchTime < 2500 && !init) {
                    return;
                }

                setLocation({ latitude, longitude });
                if (init) {
                    setInit(!init)
                }
            },
            (error) => {
                if (error.code === 2) { // 위치 서비스가 사용 불가능한 경우
                    // 위치 서비스 활성화 요청
                    Alert.alert(
                        'GPS Required',
                        'Please turn on GPS for better experience',
                    [
                        {
                        text: 'Go to GPS Settings',
                        onPress: () => {
                            IntentLauncher.startActivity({
                                action: 'android.settings.LOCATION_SOURCE_SETTINGS'
                            });
                        }
                        },
                        {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel',
                        },
                    ]
                    );
                }
              },
            {
                enableHighAccuracy: true,
                interval: 1500,
                distanceFilter: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );

        return () => {
            Geolocation.clearWatch(watchId);
        };
    }, [lastTouchTime]);

    const handleTouch = () => {
        
    }

    const handleOnCameraChange = (cameraChangeEvent: Region) => {
        // console.log(cameraChangeEvent)
        // 사용자가 지도를 터치할 때마다 현재 시간을 저장한다.
        setLastTouchTime(Date.now());
        setRegion(cameraChangeEvent)
    }

    const isInsideMap = (deviceCoord, mapBounds) => {
        return deviceCoord.latitude >= mapBounds[0].latitude && 
               deviceCoord.latitude <= mapBounds[2].latitude && 
               deviceCoord.longitude >= mapBounds[0].longitude && 
               deviceCoord.longitude <= mapBounds[2].longitude;
    }
    
    const adjustDevicePosition = (deviceCoord, mapCenter, mapBounds) => {
        let adjustedCoord = { ...deviceCoord };
        
        // 위/아래 경계 확인
        if(deviceCoord.latitude > mapBounds[2].latitude) adjustedCoord.latitude = mapBounds[2].latitude;
        if(deviceCoord.latitude < mapBounds[0].latitude) adjustedCoord.latitude = mapBounds[0].latitude;
    
        // 좌/우 경계 확인
        if(deviceCoord.longitude > mapBounds[2].longitude) adjustedCoord.longitude = mapBounds[2].longitude;
        if(deviceCoord.longitude < mapBounds[0].longitude) adjustedCoord.longitude = mapBounds[0].longitude;
    
        return adjustedCoord;
    }
    
    

    const userMarker = useMemo(() => {
        if (!location) return null;
        return (
            <Marker coordinate={location} width={25} height={25} onClick={()=>console.log('click current')}>
                <MaterialCommunityIcons name="circle-slice-8" size={25} color="red" />
            </Marker>
        );
    }, [location]);

    const deviceMarkers = useMemo(() => {
        if (!fetchedWData || fetchedWData.length === 0) return null;
        return fetchedWData.map((device:DeviceDataType, i) => {
            let deviceCoord = device.location;
            if(!isInsideMap(deviceCoord, region?.coveringRegion)) {
                deviceCoord = adjustDevicePosition(deviceCoord, region, region?.coveringRegion);
            }
            return (
                <Marker key={`deviceM_${i}`} coordinate={device.location} width={35} height={35} >
                    <View style={styles.markerContainer} key={`deviceV_${i}`}>
                        <MaterialCommunityIcons key={`deviceI_${i}`} name="flag" size={35} color="#9418db" />
                        <Text style={styles.deviceIdText} key={`deviceT_${i}`}>{device.deviceid}</Text>
                    </View>
                </Marker>
            )
        });
    }, [fetchedWData, region]);

    const distanceLines = useMemo(() => {
        if (!location || !fetchedWData) return null;
        const userLat = location.latitude!;
        const userLon = location.longitude!;
        return fetchedWData.map((device: DeviceDataType, i) => {
            const deviceLat = device.location.latitude!;
            const deviceLon = device.location.longitude!;
            const distance = calculateDistance(userLat, userLon, deviceLat, deviceLon);
            if (distance <= 3) {
                const midLat = (userLat + deviceLat) / 2;
                const midLon = (userLon + deviceLon) / 2;
                return (
                    <>
                        <Polyline
                            key={`lineP_${i}`}
                            coordinates={[location, device.location]}
                            strokeWidth={5}
                            strokeColor="#ff641c"/>
                        <Marker 
                            key={`distanceM_${i}`}
                            coordinate={{latitude: midLat, longitude: midLon}}
                            anchor={{ x: 0.5, y: 0.5 }}
                            width={35} height={35}
                        >
                            <View style={styles.distanceContainer} key={`distanceV_${i}`}>
                                <Text key={`distanceT_${i}`} style={styles.distanceText}>{`${distance.toFixed(3)*1000}m`}</Text>
                            </View>
                        </Marker>
                    </>
                );
            }
            return null;
        });
    }, [location, fetchedWData]);

    return (
        <View style={styles.allContainer}>
            <NaverMapView 
                setLocationTrackingMode={0}
                showsMyLocationButton={true}
                compass={true}
                scaleBar={true}
                nightMode={false}
                zoomControl={true}
                logoMargin={{left: -50}}
                mapType={mapType}
                style={{ height:"100%" }}
                center={{ ...location, zoom: 16 }}
                onTouch={handleTouch}
                onCameraChange={handleOnCameraChange}
            >
                {userMarker}
                {deviceMarkers}
                {distanceLines}
            </NaverMapView>
            
            <ActionButton buttonColor={Theme.COLORS.LABEL}>
                {
                    Object.entries(MAP_TYPE).map(([key, value], i) => (
                        <ActionButton.Item buttonColor={Theme.COLORS.BUTTON_COLOR} title={key} key={`ab_${i}`} onPress={() => setMapType(value)}>
                            <MaterialCommunityIcons key={`abI_${i}`} name="map-legend" color={'#fff'} size={25}/>
                        </ActionButton.Item>
                    ))
                }
            </ActionButton>
        </View>
    );
};

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

const styles = StyleSheet.create({
    allContainer: {
        height:'100%'
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
        borderWidth: 0.5
    },
    distanceText: {
        fontSize: 10,
        color: 'black'
    }
});

export default MapComponent;
