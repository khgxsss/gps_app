import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, ImageBackground } from "react-native";
import Theme from '../../Constants/Theme';
import { useAuth } from '../../Navigation/AuthContext';

const LoginComponent = () => {

  const { user, handleSignIn } = useAuth();
  if (!user.uid) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={ require('../../assets/images/startpage.png') }
          style={{height:'100%'}}>
        <View style={{ padding: 50,height:'100%', justifyContent:'center', marginTop:'40%'}}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              handleSignIn();
            }}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setActiveTab("Map");
            }}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity> */}
        </View>
        </ImageBackground>
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
  },
  buttonContainer: {
    backgroundColor: Theme.COLORS.SUCCESS,
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 20,
  },
});

export default LoginComponent;