import React, { useEffect, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents } from 'react-native-firebaseui-auth';
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import Color from "./constants/color";
import Font from "./constants/font";


const LoginComponent = ({ user, setUser, activeTab, setActiveTab }: { user: any, setUser: any, activeTab: any, setActiveTab: any }) => {

  useEffect(() => {
    const eventListener = AuthEventEmitter.addListener(
      AuthEvents.AUTH_STATE_CHANGED,
      event => {
        console.log(event)
      }
    );
    // useEffect 내부에서 반환하는 함수는 컴포넌트가 언마운트 될 때 호출됩니다.  
    return () => {
      eventListener.remove(); // Removes the listener
    };
  }, []);

  const config = {
    providers: [
      'google'
    ],
    tosUrl: 'https://example.com/tos.htm',
    privacyPolicyUrl: 'https://example.com/privacypolicy.htm',
  };

  const handleSignIn = async () => {
    try {
      const signedInUser = await Auth.signIn(config);
      console.log(signedInUser.displayName)
      setUser(signedInUser.displayName)
    } catch (err) {
      console.log(err);
    }
  };

  const handleGetCurrentUser = async () => {
    try {
      const currentUser = await Auth.getCurrentUser();
      console.log(currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await Auth.signOut();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const result = await Auth.deleteUser();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };
  if (!user) {
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
              setActiveTab("List");
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