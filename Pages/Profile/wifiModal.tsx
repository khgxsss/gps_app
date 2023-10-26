import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuth } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';
import ProgressCircle from 'react-native-progress/Circle';

import WifiManager, { WifiEntry, WiFiObject } from 'react-native-wifi-reborn';

const WifiModalComponent: React.FC = () => {

    const { isWifiModalVisible, setWifiModalVisible, loading, setLoading  } = useAuth();
    const [wifiList, setWifiList] = useState<WifiEntry[]>([]);
    const [selectedWifi, setSelectedWifi] = useState<WiFiObject>();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
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
    }, [wifiList]);

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
        try {
            let list:WifiEntry[] = await WifiManager.loadWifiList();
            // Hidden SSID 제외
            list = list.filter(wifi => wifi.SSID && wifi.SSID.trim() !== '(hidden SSID)');
            setWifiList(list);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const reFetchWifiList = async () => {
        setLoading(true);
        try {
            let list:WifiEntry[] = await WifiManager.reScanAndLoadWifiList();
            // Hidden SSID 제외
            list = list.filter(wifi => wifi.SSID && wifi.SSID.trim() !== '(hidden SSID)');
            setWifiList(list);
            setLoading(false);
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
        reFetchWifiList()
    };

    const getWifiSecurity = (capabilities: string) => {
        const securityKeys = ['WPA', 'WEP', 'EAP'];
        const securityType = securityKeys.find(key => capabilities.includes(key));
        return securityType || 'None'; // None을 반환하는 것은 해당 Wi-Fi가 보안이 설정되어 있지 않음을 의미합니다.
    }

    const hasWifiSecurity = (capabilities: string) => {
        const securityKeys = ['WPA', 'WEP', 'EAP'];
        return securityKeys.some(key => capabilities.includes(key));
    }

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={isWifiModalVisible}
            onRequestClose={() => {
                setWifiModalVisible(!isWifiModalVisible);
            }}
            >
            {
                loading && (
                    <TouchableOpacity
                        style={styles.loadingContainer}
                        activeOpacity={1}
                    >
                    <ProgressCircle color={'green'} showsText={false} indeterminate={true} size={50}/>
                    <Text style={{color:Theme.COLORS.WHITE}}>Loading...</Text>
                    </TouchableOpacity>
                )
            }
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
            >
                <View style={styles.modalView}>                  
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
                                    <Text style={{color:wifi.SSID === connectedWifi ? Theme.COLORS.WHITE : Theme.COLORS.BLACK}}>{' '+wifi.SSID}</Text>
                                    <MaterialCommunityIcons 
                                        name={getWifiStrengthIcon(wifi.level)}
                                        size={24}
                                        color={wifi.SSID === connectedWifi ? Theme.COLORS.WHITE : Theme.COLORS.BLACK}
                                    />
                                </TouchableOpacity>
                            ))
                        }
                        </TouchableOpacity>
                    </ScrollView>
                    <TouchableOpacity 
                            onPress={reFetchWifiList} 
                            style={styles.refreshButton}
                    ><MaterialCommunityIcons name="sync-circle" color={Theme.COLORS.PRIMARY} size={50}/></TouchableOpacity>
                    <TouchableOpacity 
                            onPress={()=>setWifiModalVisible(false)} 
                            style={styles.closeButton}
                    ><MaterialCommunityIcons name="close-box" color={Theme.COLORS.PRIMARY} size={50}/></TouchableOpacity>
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
                                <Text style={{color:Theme.COLORS.PRIMARY, marginBottom:20, fontWeight:'bold'}}>{selectedWifi?.SSID}</Text>
                                <Text style={{color:Theme.COLORS.BLACK, marginBottom:20}}>Wifi Security: {selectedWifi && getWifiSecurity(selectedWifi.capabilities)}</Text>
                                {
                                    selectedWifi && hasWifiSecurity(selectedWifi.capabilities) && (
                                        <>
                                            <Text style={{backgroundColor:Theme.COLORS.WHITE, color:Theme.COLORS.BLACK}}>{'\n'}Please type WIFI Password{'\n'}</Text>
                                            <View style={{height:1, backgroundColor:'#000'}}></View>
                                            <TextInput
                                                placeholder="Input Password here"
                                                placeholderTextColor={Theme.COLORS.DEFAULT}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                        </>
                                    )
                                }
                                <View style={{height:1, backgroundColor:'#000', marginBottom: 40}}></View>
                                <TouchableOpacity style={styles.modalView2Button} onPress={connectToWifi} ><Text style={{color:Theme.COLORS.BLACK, fontWeight:'bold'}}>Confirm</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modalView2Button} onPress={() => {setShowPasswordModal(false);reFetchWifiList()}} ><Text style={{color:Theme.COLORS.BLACK}}>Cancel</Text></TouchableOpacity>
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
        marginLeft: '15%',
        padding: 4,
        flexDirection: 'row'
    },
    refreshButton: {
        position:'absolute',
        top: 80,
        left: 20
    },
    closeButton: {
        position:'absolute',
        top: 20,
        left: 20
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
        width: "80%",
        height: "50%",
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
    },
    loadingContainer: {
        position:'absolute',
        width:'100%',
        height:'100%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // 반투명한 회색 배경
        zIndex: 10
    }
})
export default WifiModalComponent;