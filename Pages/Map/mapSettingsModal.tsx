import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';
import ReactNativeSettingsPage, { CheckRow, NavigateRow, SectionRow, SliderRow, SwitchRow } from 'react-native-settings-page-fork1'
import { useAuth } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';

const MapSettingsModalComponent: React.FC = () => {

    const { tabHistory, setTabHistory,  isMapSettingsModalVisible, setMapSettingsModalVisible, locationSaved, setLocationSaved, setMapLocationSettingsFirebase, seeAllDevices, setSeeAllDevices, seeDistanceLines, setSeeDistanceLines  } = useAuth();

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
                    <ScrollView persistentScrollbar={false} >
                        <ReactNativeSettingsPage>
                            <SectionRow text='Map Settings'>
                                <SwitchRow 
                                    text='See all device ids' 
                                    iconName='eye'
                                    _value={seeAllDevices}
                                    _onValueChange={() => {setSeeAllDevices(!seeAllDevices)}} />
                                <SwitchRow 
                                    text='See distance lines (radius: 3km)' 
                                    iconName='eye'
                                    _value={seeDistanceLines}
                                    _onValueChange={() => {setSeeDistanceLines(!seeDistanceLines)}} />
                                <SliderRow 
                                    text={`Set Default Map Zoom Level (1~20) : ${locationSaved.mapZoomLevel}`}
                                    iconName='expand'
                                    _color='#000'
                                    _min={1}
                                    _max={20}
                                    _value={locationSaved.mapZoomLevel}
                                    _onValueChange={()=>{}}
                                    _onSlidingComplete={(e)=>setLocationSaved({...locationSaved,mapZoomLevel:e})} />
                            </SectionRow>
                            <SectionRow text='Server Settings'>
                                <TextInput></TextInput>
                            </SectionRow>
                            <SectionRow text='goBack'>
                                <NavigateRow
                                    text='save & close'
                                    iconName='save'
                                    onPressCallback={async () => {
                                        await setMapLocationSettingsFirebase();
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
        backgroundColor: "rgba(0,0,0,0.5)", // 반투명한 회색 배경
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