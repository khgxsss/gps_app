import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { height, useAuth, width } from '../../Navigation/AuthContext';
import Theme from '../../Constants/Theme';

const MapSettingsModalComponent: React.FC = () => {

    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory,  isMapSettingsModalVisible, setMapSettingsModalVisible, loading, setLoading  } = useAuth();

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
    }
})
export default MapSettingsModalComponent;