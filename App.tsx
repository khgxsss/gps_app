import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { AuthProvider, height, useAuth } from './Navigation/AuthContext';

import Tabbar from './Navigation/TabBar';
import { MaterialCommunityIcons } from './Components/IconSets';
import Todos from './Pages/Analytics/Todos';
import MapComponent from './Pages/Map/main';
import LoginComponent from './Pages/Login/main';
import ProfileComponent from './Pages/Profile/main';
import WebSocketComponent from './Components/Websocket/main';
import { Block, GalioProvider } from 'galio-framework';
import { Images, materialTheme } from "./Constants/";
import Theme from './Constants/Theme';

function App(): JSX.Element {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory } = useAuth();
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Todos user={user.displayName} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      case 'Map':
        return <MapComponent/>;
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
                tabBarContainerBackground={Theme.COLORS.SECONDARY}
                tabBarBackground={Theme.COLORS.WHITE}
                activeTabBackground={Theme.COLORS.PRIMARY}
                labelStyle={styles.labelStyle}
                onTabChange={(e) => setActiveTab(e.name)}
                defaultActiveTabIndex={1}
              />
            </>
          ):(
            <></>
          )
        }
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
    height: height-57
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
    activeIcon: <MaterialCommunityIcons name="google-analytics" color={Theme.COLORS.WHITE} size={25} />,
    inactiveIcon: <MaterialCommunityIcons name="google-analytics" color="#949494" size={25} />,
  },
  {
    name: 'Map',
    activeIcon: <MaterialCommunityIcons name="ship-wheel" color={Theme.COLORS.WHITE} size={25} />,
    inactiveIcon: <MaterialCommunityIcons name="ship-wheel" color="#949494" size={25} />,
  },
  {
    name: 'Profile',
    activeIcon: <MaterialCommunityIcons name="account-details" color={Theme.COLORS.WHITE} size={25} />,
    inactiveIcon: <MaterialCommunityIcons name="account-details" color="#949494" size={25} />,
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
