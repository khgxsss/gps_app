import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { useAuth } from '../../Navigation/AuthContext';
import Color from "./constants/color";
import Font from "./constants/font";

const LoginComponent = () => {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE } = useAuth();
  if (!user.uid) {
    return (
      <View style={styles.container}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={require("./images/ic_homepage.png")} />
        </View>
        <View style={{ padding: 50 }}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              handleSignIn();
            }}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setActiveTab("Map");
            }}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else{
    return (
      <></>
    );
  }
  
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Color.white,
    justifyContent: "center"
  },
  buttonContainer: {
    backgroundColor: Color.primary,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: Color.white,
    fontFamily: Font.FONT_SEMI_BOLD,
    fontSize: 20,
  },
});

export default LoginComponent;