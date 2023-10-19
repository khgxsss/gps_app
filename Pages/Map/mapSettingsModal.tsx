import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';
import ReactNativeSettingsPage, { CheckRow, NavigateRow, SectionRow, SliderRow, SwitchRow } from 'react-native-settings-page-fork1'
import { height, useAuth, width } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';

const MapSettingsModalComponent: React.FC = () => {

    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory,  isMapSettingsModalVisible, setMapSettingsModalVisible, loading, setLoading, defaultMapZoomLevel, setDefaultMapZoomLevel, setMapZoomLevelFirebase  } = useAuth();

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={isMapSettingsModalVisible}
            onRequestClose={() => {
                setMapSettingsModalVisible(!isMapSettingsModalVisible);
            }}
            >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
            >
                <View style={styles.modalView}>
                    <ScrollView persistentScrollbar={true} >
                        <ReactNativeSettingsPage>
                            <SectionRow text='Map Settings'>
                                <SwitchRow 
                                    text='See all device ids' 
                                    iconName='eye'
                                    _value={true}
                                    _onValueChange={() => { }} />
                                <SliderRow 
                                    text={`Set Default Map Zoom Level (0~21) : ${defaultMapZoomLevel}`}
                                    iconName='expand'
                                    _color='#000'
                                    _min={0}
                                    _max={21}
                                    _value={defaultMapZoomLevel}
                                    _onValueChange={()=>{}}
                                    _onSlidingComplete={(e)=>setDefaultMapZoomLevel(e)} />
                                <NavigateRow
                                    text='save & close'
                                    iconName='save'
                                    onPressCallback={async () => {
                                        await setMapZoomLevelFirebase();
                                        setMapSettingsModalVisible(false);
                                    }}/>
                            </SectionRow>
                        </ReactNativeSettingsPage>
                    </ScrollView>
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
        backgroundColor: "rgba(0,0,0,0.5)", // �������� ȸ�� ���
    },
    modalView: {
        position:'absolute',
        width: "90%",
        height: "40%",
        padding: 20,
        backgroundColor:Theme.COLORS.WHITE,
        borderRadius: 10,
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    }
})
export default MapSettingsModalComponent;