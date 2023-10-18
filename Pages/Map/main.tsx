import React, { useState, useEffect, useMemo } from 'react';
import { Button, View, TouchableOpacity, Text, StyleSheet, Alert, Linking, PermissionsAndroid } from 'react-native';
import NaverMapView, { Coord, Marker, Polyline } from 'react-native-nmap-fork1';
import Geolocation from 'react-native-geolocation-service';
import { Ionicons, MaterialCommunityIcons } from '../../Components/IconSets';
import ActionButton from 'react-native-action-button-fork1';
import IntentLauncher from 'react-native-intent-launcher-fork1';
import { componentHeight, DeviceDataType, Region, useAuth, width } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';
import { calculateDistance, hexToRgb } from '../../Utils/utils';
import MapSettingsModalComponent from './mapSettingsModal';

const MapComponent = () => {
    const [location, setLocation] = useState<Coord>({ latitude: 37.35882350130591, longitude: 127.10469231924353 });
    const [init, setInit] = useState<boolean>(true)
    const [lastTouchTime, setLastTouchTime] = useState<number | null>(null);
    const [region, setRegion] = useState<Region>({"contentRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "coveringRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "latitude": 36.43816920000003, "longitude": 127.41290420000009, "zoom": 16});
    // 현재 표시되어야 하는 deviceid를 저장하는 상태
    const [showDeviceId, setShowDeviceId] = useState<string | null>(null);
    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, isMapSettingsModalVisible, setMapSettingsModalVisible, tabHistory, setTabHistory } = useAuth();
    
    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                // 사용자가 마지막으로 지도를 터치한 시점에서 2.5초가 지나지 않았다면 위치를 업데이트 하지 않는다. 또는 맵 종류 세팅중일때
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

    const isInsideMap = (deviceCoord: Coord, mapBounds: Coord[]) => {
        return deviceCoord.latitude >= mapBounds[0].latitude && 
               deviceCoord.latitude <= mapBounds[2].latitude && 
               deviceCoord.longitude >= mapBounds[0].longitude && 
               deviceCoord.longitude <= mapBounds[2].longitude;
    }
    
    const adjustDevicePosition = (deviceCoord: Coord, mapBounds: Coord[]) => {
        const [bottomLeft, topLeft, topRight, bottomRight] = mapBounds;
    
        let adjustedCoord = { ...deviceCoord };
    
        // 위/아래 경계 확인
        if (deviceCoord.latitude > topRight.latitude) {
            adjustedCoord.latitude = topRight.latitude;
        } else if (deviceCoord.latitude < bottomLeft.latitude) {
            adjustedCoord.latitude = bottomLeft.latitude;
        }
    
        // 좌/우 경계 확인
        if (deviceCoord.longitude > topRight.longitude) {
            adjustedCoord.longitude = topRight.longitude;
        } else if (deviceCoord.longitude < topLeft.longitude) {
            adjustedCoord.longitude = topLeft.longitude;
        }
    
        return adjustedCoord;
    };    

    const userMarker = useMemo(() => {
        if (!location) return null;
        return (
            <Marker coordinate={location} height={25} width={25} anchor={{ x: 0.5, y: 0.5 }}>
                <MaterialCommunityIcons name="circle-slice-8" size={25} color="red" />
            </Marker>
        );
    }, [location]);

    const deviceMarkers = useMemo(() => {
        if (!fetchedWData || fetchedWData.length === 0) return null;
        return fetchedWData.map((device:DeviceDataType, i) => {
            let deviceCoord = device.location;
            if(!isInsideMap(deviceCoord, region?.coveringRegion)) {
                deviceCoord = adjustDevicePosition(deviceCoord, region.coveringRegion);
            }
            return (
                <Marker 
                    key={`deviceM_${i}`} 
                    hidden={false}
                    coordinate={deviceCoord}
                    caption={showDeviceId === device.deviceid? {'text':device.deviceid, 'textSize':12, 'color':'#fffb00', 'haloColor':'#000'} : {}}
                    width={35}
                    height={35}
                    anchor={{ x: 0.5, y: 0.5 }}
                    onClick={() => handleDeviceClick(device.deviceid)} // 마커 클릭 핸들러 추가
                >
                    <MaterialCommunityIcons key={`deviceI_${i}`} name="panorama-sphere" size={35} color={(Date.now() - device.receivedtime < 120000) ? Theme.COLORS.DEVICE_ON : Theme.COLORS.DEVICE_OFF} />
                </Marker>
            )
        });
    }, [fetchedWData, region, showDeviceId]);

    const handleDeviceClick = (deviceId: string) => {
        // 이미 표시된 deviceid를 클릭하면 숨기고, 그렇지 않으면 표시합니다.
        if (showDeviceId === deviceId) {
            setShowDeviceId(null);
        } else {
            setShowDeviceId(deviceId);
        }
    }

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
                    <View key = {i}>
                        <Polyline
                            key={`lineP_${i}`}
                            coordinates={[location, device.location]}
                            strokeWidth={2}
                            strokeColor="#ff641c"/>
                        <Marker 
                            key={`distanceM_${i}`}
                            coordinate={{latitude: midLat, longitude: midLon}}
                            anchor={{ x: 0.5, y: 0.5 }}
                            width={40} height={35}
                        >
                            <View style={styles.distanceContainer} key={`distanceV_${i}`}>
                                <Text key={`distanceT_${i}`} style={styles.distanceText}>{`${distance.toFixed(3)*1000}m`}</Text>
                            </View>
                        </Marker>
                    </View>
                );
            }
            return null;
        });
    }, [location, fetchedWData]);

    return (
        <View style={styles.allContainer}>
            <NaverMapView 
                setLocationTrackingMode={0}
                showsMyLocationButton={false}
                compass={true}
                scaleBar={true}
                nightMode={false}
                zoomControl={true}
                logoMargin={{left: -50}}
                mapType={mapType}
                style={{ height:"100%" }}
                center={{ ...location, zoom: 13 }}
                onTouch={handleTouch}
                onCameraChange={handleOnCameraChange}
            >
                {userMarker}
                {deviceMarkers}
                {distanceLines}
            </NaverMapView>
            
            <ActionButton 
                buttonColor={`rgba(${r}, ${g}, ${b}, 0.5)`}>
                <ActionButton.Item 
                    buttonColor={Theme.COLORS.BUTTON_COLOR} 
                    title={'Settings'}
                    onPress={() => {setMapSettingsModalVisible(true);}}>
                    <Ionicons name="settings-sharp" color={'#fff'} size={25}/>
                </ActionButton.Item>
                <ActionButton.Item 
                    buttonColor={Theme.COLORS.BUTTON_COLOR} 
                    title={'BASIC'}
                    onPress={() => {setMapType(0);}}>
                    <MaterialCommunityIcons name="map" color={'#fff'} size={25}/>
                </ActionButton.Item>
                <ActionButton.Item 
                    buttonColor={Theme.COLORS.BUTTON_COLOR} 
                    title={'SATELLITE'}
                    onPress={() => {setMapType(2);}}>
                    <MaterialCommunityIcons name="satellite-variant" color={'#fff'} size={25}/>
                </ActionButton.Item>
                <ActionButton.Item 
                    buttonColor={Theme.COLORS.BUTTON_COLOR} 
                    title={'HYBRID'}
                    onPress={() => {setMapType(3);}}>
                    <MaterialCommunityIcons name="satellite" color={'#fff'} size={25}/>
                </ActionButton.Item>
                <ActionButton.Item 
                    buttonColor={Theme.COLORS.BUTTON_COLOR} 
                    title={'TERRAIN'}
                    onPress={() => {setMapType(4);}}>
                    <MaterialCommunityIcons name="map-legend" color={'#fff'} size={25}/>
                </ActionButton.Item>
            </ActionButton>
            {

            }
            <MapSettingsModalComponent/>
        </View>
    );
};

const { r, g, b } = hexToRgb(Theme.COLORS.LABEL);

const styles = StyleSheet.create({
    allContainer: {
        height:'100%'
    },
    markerContainer: {
        alignItems: 'center'
    },
    iconContainer: {
        position: 'absolute',
        display:'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:'auto'
    },
    deviceContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 2,
        borderRadius: 3,
        borderColor: 'gray',
        borderWidth: 0.5,
        top: 0, // 아이콘 위에 위치를 조절하려면 이 값을 조정
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
