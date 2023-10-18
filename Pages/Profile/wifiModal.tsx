import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { height, useAuth, width } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';

import WifiManager, { WifiEntry, WiFiObject } from 'react-native-wifi-reborn';
import ProgressBar from 'react-native-progress/Bar';

const WifiModalComponent: React.FC = () => {

    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory,  isWifiModalVisible, setWifiModalVisible, loading, setLoading  } = useAuth();
    const [wifiList, setWifiList] = useState<WifiEntry[]>([]);
    const [selectedWifi, setSelectedWifi] = useState<WiFiObject>();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [progress, setProgress] = useState(0);
    const [connectedWifi, setConnectedwifi] = useState<string>('');

    useEffect(() => {
        if (isWifiModalVisible) {
          fetchWifiList();
        }else {
            setWifiList([]);
        }
      }, [isWifiModalVisible]);
    useEffect(() => {
        WifiManager.getCurrentWifiSSID()
            .then((ssid) => {
            setConnectedwifi(ssid);
            })
            .catch((error) => {
            console.log("Cannot get current SSID", error);
            });
    }, []);

    useEffect(() => {
        const enableWifi = async () => {
            const wifiState = await WifiManager.isEnabled();
            if (!wifiState) {
                // Android에서만 작동합니다.
                await WifiManager.forceWifiUsageWithOptions(true, {noInternet:true});
            }
        }

        enableWifi();
    }, []);

    const fetchWifiList = async () => {
        setLoading(true);
        setProgress(0.33); // 1단계
        try {
            const list:WifiEntry[] = await WifiManager.loadWifiList();
            setWifiList(list);
            setLoading(false);
            setProgress(0.66); // 2단계
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const reFetchWifiList = async () => {
        setLoading(true);
        setProgress(0.33); // 1단계
        try {
            const list:WifiEntry[] = await WifiManager.reScanAndLoadWifiList();
            setWifiList(list);
            setLoading(false);
            setProgress(0.66); // 2단계
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const getWifiStrengthIcon = (rssi: number) => {
        if (rssi >= -50) return 'wifi-strength-4'; // 강한 신호
        else if (rssi >= -60) return 'wifi-strength-3'; // 중간 신호
        else if (rssi >= -70) return 'wifi-strength-2'; // 약한 신호
        else return 'wifi-strength-1'; // 매우 약한 신호
    };
    

    const connectToWifi = async () => {
        setLoading(true);
        try {
          await WifiManager.connectToProtectedSSID(selectedWifi.SSID, password, false, false);
          setWifiModalVisible(false);
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
        setProgress(1); // 3단계
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={isWifiModalVisible}
            onRequestClose={() => {
                setWifiModalVisible(!isWifiModalVisible);
            }}
            >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
            >
                <View style={styles.modalView}>
                    <ProgressBar progress={progress} width={null} color={Theme.COLORS.INFO} unfilledColor={Theme.COLORS.DEFAULT} style={{padding:4, margin:50}} borderWidth={0}/>                    
                    <ScrollView persistentScrollbar={true} >
                        <TouchableOpacity activeOpacity={1}>
                        {
                            wifiList.map((wifi,i) => (
                                <TouchableOpacity
                                    key={`${wifi.SSID}-${i}`}
                                    style={{
                                        ...styles.wifiList,
                                        backgroundColor: wifi.SSID === connectedWifi ? Theme.COLORS.PRIMARY : Theme.COLORS.WHITE,
                                    }}
                                    disabled={wifi.SSID === connectedWifi}
                                    onPress={() => {
                                    setSelectedWifi(wifi);
                                    setShowPasswordModal(true);
                                    }}
                                >
                                    <Text style={{color:wifi.SSID === connectedWifi ? Theme.COLORS.WHITE : undefined}}>{' '+wifi.SSID}</Text>
                                    <MaterialCommunityIcons 
                                        name={getWifiStrengthIcon(wifi.level)}
                                        size={24}
                                        color={wifi.SSID === connectedWifi ? Theme.COLORS.WHITE : undefined}
                                    />
                                </TouchableOpacity>
                            ))
                        }
                        <TouchableOpacity 
                            onPress={fetchWifiList} 
                            style={styles.refreshButton}
                        ><MaterialCommunityIcons name="sync-circle" color={Theme.COLORS.WARNING} size={50}/></TouchableOpacity>
                        </TouchableOpacity>
                    </ScrollView>
                    <Modal
                        transparent={true}
                        animationType="fade"
                        visible={showPasswordModal}
                        onRequestClose={() => {
                            setShowPasswordModal(!showPasswordModal);
                        }}
                    >
                        <TouchableOpacity
                            style={styles.modalContainer2}
                            activeOpacity={1}
                        >
                            <View style={styles.modalView2}>
                                <Text>{selectedWifi?.SSID}</Text>
                                <Text style={{backgroundColor:Theme.COLORS.WHITE}}>{'\n'}Please type WIFI Password{'\n'}</Text>
                                {
                                    selectedWifi && selectedWifi.capabilities && (
                                        <>
                                            <View style={{height:1, backgroundColor:'#000'}}></View>
                                            <TextInput
                                                placeholder="Input Password here"
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                        </>
                                    )
                                }
                                <View style={{height:1, backgroundColor:'#000', marginBottom: 40}}></View>
                                <TouchableOpacity style={styles.modalView2Button} onPress={connectToWifi} ><Text>Confirm</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modalView2Button} onPress={() => setShowPasswordModal(false)} ><Text>Cancel</Text></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // 반투명한 회색 배경
    },
    modalView: {
        width: "90%",
        height: "90%",
        padding: 20,
        backgroundColor:Theme.COLORS.SECONDARY,
        borderRadius: 10,
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    wifiList: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        borderColor: Theme.COLORS.PRIMARY,
        borderWidth: 2,
        margin: 10,
        marginLeft: '20%',
        marginRight: '20%',
        padding: 4,
        flexDirection: 'row'
    },
    refreshButton: {
        position:'absolute',
    },
    modalContainer2: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // 반투명한 회색 배경
    },
    modalView2: {
        justifyContent: 'center',
        alignContent:'center',
        width: "50%",
        height: "30%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalView2Button: {
        margin: 10,
        backgroundColor:Theme.COLORS.SECONDARY,
        padding: 10,
        borderRadius: 10
    }
})
export default WifiModalComponent;