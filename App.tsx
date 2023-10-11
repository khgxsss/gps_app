import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { AuthProvider, useAuth } from './Navigation/AuthContext';

import Tabbar from './Navigation/TabBar';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons';
import Todos from './Pages/Analytics/Todos';
import MapComponent from './Pages/Map/main';
import LoginComponent from './Pages/Login/main';
import ProfileComponent from './Pages/Profile/main';
import WebSocketComponent from './components/Websocket/main';
import { Block, GalioProvider } from 'galio-framework';
import { Images, products, materialTheme } from "./constants/";

const test_data = [
  { deviceid: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 } },
  { deviceid: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 } },
  { deviceid: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 } }
]

function App(): JSX.Element {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE } = useAuth();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Todos user={user.displayName} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      case 'Map':
        return <MapComponent mapType={mapType} setMapType={setMapType} MAP_TYPE={MAP_TYPE} patchedData={test_data}/>;
      case 'Profile':
        return <ProfileComponent/>;
      default:
        return <></>;
    }
  };
// Login dev용으로 전환
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <GalioProvider theme={materialTheme}>
      <Block flex>
        <StatusBar/>
        <LoginComponent/>
        {
          user.uid ? (
            <>
              <View style={styles.mainContent}>
                {renderTabContent()}
              </View>
              <Tabbar
                tabs={tabs}
                tabBarContainerBackground='#b0caff'
                tabBarBackground='#ffffff'
                activeTabBackground='#a0ff99'
                labelStyle={styles.labelStyle}
                onTabChange={(e) => setActiveTab(e.name)}
                defaultActiveTabIndex={1}
              />
            </>
          ):(
            <></>
          )
        }
      </Block>
      </GalioProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    height:"100%",
    backgroundColor: '#fff'
  },
  mainContent: {
    marginBottom: 70
  },
  labelStyle: {
    color: '#949494',
    fontWeight: '500',
    fontSize: 12,
  },
});

const tabs = [
  {
    name: 'Analytics',
    activeIcon: <Icon_MC name="google-analytics" color="#fff" size={25} />,
    inactiveIcon: <Icon_MC name="google-analytics" color="#949494" size={25} />,
  },
  {
    name: 'Map',
    activeIcon: <Icon_MC name="ship-wheel" color="#fff" size={25} />,
    inactiveIcon: <Icon_MC name="ship-wheel" color="#949494" size={25} />,
  },
  {
    name: 'Profile',
    activeIcon: <Icon_MC name="account-details" color="#fff" size={25} />,
    inactiveIcon: <Icon_MC name="account-details" color="#949494" size={25} />,
  },
];



const AppWrapper = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWrapper;
