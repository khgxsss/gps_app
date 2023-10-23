import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, View, TouchableOpacity, Text, StyleSheet, Alert, Linking, PermissionsAndroid } from 'react-native';
import NaverMapView, { Coord, Marker, NaverMapViewInstance, Polyline } from 'react-native-nmap-fork1';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { Ionicons, MaterialCommunityIcons } from '../../Components/IconSets';
import ActionButton from 'react-native-action-button-fork1';
import IntentLauncher from 'react-native-intent-launcher-fork1';
import { DeviceDataType, Region, useAuth } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';
import { calculateDistance, hexToRgb } from '../../Utils/utils';
import MapSettingsModalComponent from './mapSettingsModal';

const MapComponent = () => {
    const [lastTouchTime, setLastTouchTime] = useState<number | null>(null);
    const [region, setRegion] = useState<Region>({"contentRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "coveringRegion": [{"latitude": 36.43313265533338, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.40861266544789}, {"latitude": 36.44320541782096, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.41719573454998}, {"latitude": 36.43313265533338, "longitude": 127.40861266544789}], "latitude": 36.43816920000003, "longitude": 127.41290420000009, "zoom": 16});
    const mapView = useRef<NaverMapViewInstance>(null);
    
    // ���� ǥ�õǾ�� �ϴ� buoy_id�� �����ϴ� ����
    const [showDeviceId, setShowDeviceId] = useState<string | null>(null);
    const { fetchedWData, mapType, setMapType, isMapSettingsModalVisible, setMapSettingsModalVisible, cellularOn, wifiOn, locationSaved, setLocationSaved, setMapLocationSettingsFirebase, seeAllDevices, seeDistanceLines } = useAuth();
    const [showUpdateLocationButton, setShowUpdateLocationButton] = useState(false);

    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                // ����ڰ� ���������� ������ ��ġ�� �������� 2.5�ʰ� ������ �ʾҴٸ� ��ġ�� ������Ʈ ���� �ʴ´�.
                if (lastTouchTime && Date.now() - lastTouchTime < 2500) {
                    return;
                }
                mapView.current?.animateToCoordinate({ latitude, longitude });
                setLocationSaved({...locationSaved, latitude:latitude, longitude:longitude })
                setShowUpdateLocationButton(false)
            },
            (error) => {
                switch (error.code) {
                    case 1: 
                        requestLocationPermission();
                        break;
                    case 2: 
                        setShowUpdateLocationButton(false)
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
                        break;
                }
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
            Geolocation.clearWatch(watchId);
            setMapLocationSettingsFirebase()
        };
    }, [lastTouchTime]);

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "This app requires access to your location.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Location permission granted");
                // ������ ���� ����� ������ �߰��մϴ�.
            } else {
                console.log("Location permission denied");
                // ������ �źε� ����� ������ �߰��մϴ�.
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const handleOnCameraChange = (cameraChangeEvent: Region) => {
        // ����ڰ� ������ ��ġ�� ������ ���� �ð��� �����Ѵ�.
        setLastTouchTime(Date.now());
        setRegion(cameraChangeEvent);
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
    
        // ��/�Ʒ� ��� Ȯ��
        if (deviceCoord.latitude > topRight.latitude) {
            adjustedCoord.latitude = topRight.latitude;
        } else if (deviceCoord.latitude < bottomLeft.latitude) {
            adjustedCoord.latitude = bottomLeft.latitude;
        }
    
        // ��/�� ��� Ȯ��
        if (deviceCoord.longitude > topRight.longitude) {
            adjustedCoord.longitude = topRight.longitude;
        } else if (deviceCoord.longitude < topLeft.longitude) {
            adjustedCoord.longitude = topLeft.longitude;
        }
    
        return adjustedCoord;
    };

    const moveToCurrentLocation = async () => {
        try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            // ���� �߽��� ���� ��ġ�� �̵�
            mapView.current?.animateToCoordinate({ latitude, longitude });
            
            setShowUpdateLocationButton(false)
        } catch (error) {
            console.error("Error fetching current position:", error);
        }
    };
    
    const getCurrentPosition = (): Promise<GeoPosition> => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position => resolve(position),
                error => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 1000,
                    forceRequestLocation: true
                }
            );
        });
    };

    const userMarker = useMemo(() => {
        if (!mapView.current || !mapView.current.props.center) return null;
        
        const { zoom, ...rest } = mapView.current.props.center;
        return (
            <Marker coordinate={rest} height={25} width={25} anchor={{ x: 0.5, y: 0.5 }}>
                <MaterialCommunityIcons name="circle-slice-8" size={25} color="red" />
            </Marker>
        );
    }, [mapView.current?.props.center]);

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
                    caption={!seeAllDevices ? showDeviceId === device.buoy_id? {'text':device.buoy_id, 'textSize':12, 'color':'#fffb00', 'haloColor':'#000'} : {} : {'text':device.buoy_id, 'textSize':12, 'color':'#fffb00', 'haloColor':'#000'}}
                    width={35}
                    height={35}
                    anchor={{ x: 0.5, y: 0.5 }}
                    onClick={() => handleDeviceClick(device.buoy_id)} // ��Ŀ Ŭ�� �ڵ鷯 �߰�
                >
                    <MaterialCommunityIcons key={`deviceI_${i}`} name="panorama-sphere" size={35} color={(Date.now() - device.time_generation.time < 120000) ? Theme.COLORS.DEVICE_ON : Theme.COLORS.DEVICE_OFF} />
                </Marker>
            )
        });
    }, [fetchedWData, region, showDeviceId]);

    const handleDeviceClick = (deviceId: string) => {
        // �̹� ǥ�õ� buoy_id�� Ŭ���ϸ� �����, �׷��� ������ ǥ���մϴ�.
        if (showDeviceId === deviceId) {
            setShowDeviceId(null);
        } else {
            setShowDeviceId(deviceId);
        }
    }

    const distanceLines = useMemo(() => {
        if (!locationSaved || !fetchedWData) return null;
        const userLat = locationSaved.latitude!;
        const userLon = locationSaved.longitude!;
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
                            coordinates={[{latitude: locationSaved.latitude,longitude: locationSaved.longitude}, device.location]}
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
    }, [locationSaved, fetchedWData]);

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
                center={locationSaved ? {latitude: locationSaved.latitude, longitude:locationSaved.longitude, zoom: locationSaved.mapZoomLevel}:{latitude: 37.35882350130591, longitude: 127.10469231924353, zoom: 13}}
                onCameraChange={handleOnCameraChange}
                onTouch={()=>(!showUpdateLocationButton)&& setShowUpdateLocationButton(true)}
                ref={mapView}
            >
                {userMarker}
                {deviceMarkers}
                {seeDistanceLines && distanceLines}
                
            </NaverMapView>
            <View style={styles.upperContainer}>
                <View style={styles.networkState}>
                    <View style={{...styles.networkState1, backgroundColor:wifiOn?Theme.COLORS.NETWORK_STATUS_ON:Theme.COLORS.NETWORK_STATUS_OFF}}>
                        <Text style={styles.networkStateText}>WiFi</Text>
                        <MaterialCommunityIcons name="signal-variant" color={'#000'} size={13}/>
                    </View>
                    <View style={{...styles.networkState2, backgroundColor:cellularOn?Theme.COLORS.NETWORK_STATUS_ON:Theme.COLORS.NETWORK_STATUS_OFF}}>
                        <Text style={styles.networkStateText}>Cellular</Text>
                        <MaterialCommunityIcons name="signal" color={'#000'} size={13}/>
                    </View>
                </View>
                {
                    showUpdateLocationButton && (
                        <TouchableOpacity
                            style={styles.updateLocationButton}
                            onPress={moveToCurrentLocation}>
                            <MaterialCommunityIcons name="navigation-variant" color={Theme.COLORS.PRIMARY} size={20}/>
                            <Text style={styles.updateLocationButtonText}> Back to My Location</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
            
            <ActionButton 
                buttonColor={Theme.COLORS.SETINGS_BTN}>
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
                isMapSettingsModalVisible && (
                    <MapSettingsModalComponent/>
                )
            }
        </View>
    );
};

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
        top: 0, // ������ ���� ��ġ�� �����Ϸ��� �� ���� ����
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
    },
    upperContainer: {
        position: 'absolute',
        display:'flex',
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    updateLocationButton: {
        width:'auto',
        backgroundColor: Theme.COLORS.SECONDARY,
        flexDirection:'row',
        padding: 10,
        marginTop: 30,
        marginRight: 30,
        borderRadius: 20,
        borderColor: 'gray',
        borderWidth: 0.5,
    },
    updateLocationButtonText: {
        fontSize: 14,
        color: 'black',
    },
    networkState: {
        width:'auto',
        flexDirection:'row',
        marginTop: 30,
        marginLeft: 30,
    },
    networkState1: {
        width:'auto',
        flexDirection:'row',
        padding: 5,
        borderRadius: 20,
        borderColor: 'gray',
        borderWidth: 0.5,
    },
    networkState2: {
        width:'auto',
        flexDirection:'row',
        padding: 5,
        borderRadius: 20,
        borderColor: 'gray',
        borderWidth: 0.5,
        marginLeft: 10
    },
    networkStateText: {
        fontSize: 10,
        color: 'black',
    }
});

export default MapComponent;
