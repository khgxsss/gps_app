import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';

import Theme from '../Constants/Theme';

import ProgressCircle from 'react-native-progress/Circle';

const LoaderComponent: React.FC = () => {
    return (
        <TouchableOpacity
                style={styles.bgContainer}
                activeOpacity={1}
        >
            <ProgressCircle color={'green'} showsText={true}/>
            <Text>Loading...</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    bgContainer: {
        width:'100%',
        height:'100%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // �������� ȸ�� ���
        zIndex: 10
    }
})
export default LoaderComponent;