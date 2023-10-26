import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View, Modal, TouchableOpacity, TextInput, Text, Button} from 'react-native';

import Theme from '../Constants/Theme';

import ProgressCircle from 'react-native-progress/Circle';

const LoaderComponent: React.FC = () => {
    return (
        <View style={styles.bgContainer}
        >
            <ProgressCircle color={'green'} showsText={false} indeterminate={true}/>
            <Text style={{color:Theme.COLORS.WHITE}}>Loading...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    bgContainer: {
        width:'100%',
        height:'100%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // 반투명한 회색 배경
        zIndex: 10
    }
})
export default LoaderComponent;