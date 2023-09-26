import React, { useEffect, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents } from 'react-native-firebaseui-auth';
import { Button, View } from 'react-native';
import { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

const LoginComponent = ({ user, setUser }: { user: any, setUser: any }) => {

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
      <View style={styles}>
        <Button title="Login" onPress={handleSignIn} />
      </View>
    );
  } else{
    return (
      <></>
    );
  }
  
};

const styles:ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

export default LoginComponent;