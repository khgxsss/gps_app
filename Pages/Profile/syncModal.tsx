import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity } from 'react-native';
import { Block, Button, Text, theme } from 'galio-framework';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../components/IconSets';

import { materialTheme } from '../../constants';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { height, useAuth, width } from '../../Navigation/AuthContext';
import Theme from '../../constants/Theme';

const SyncModalComponent = ({isModalVisible, setModalVisible}) => {

    const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory } = useAuth();

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={() => {
                setModalVisible(!isModalVisible);
            }}
            >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPressOut={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                <Text>API 연동 작업을 여기서 진행하세요.</Text>
                <Button onPress={() => setModalVisible(false)}>닫기</Button>
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
        width: "80%",
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
    }
})
export default SyncModalComponent;