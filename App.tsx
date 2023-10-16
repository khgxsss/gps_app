import React, { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from './components/IconSets';

import { AuthProvider, componentHeight, useAuth } from './Navigation/AuthContext';
import IntentLauncher from 'react-native-intent-launcher-fork1';

import Tabbar from './Navigation/TabBar';
import Todos from './Pages/Analytics/Todos';
import MapComponent from './Pages/Map/main';
import LoginComponent from './Pages/Login/main';
import ProfileComponent from './Pages/Profile/main';
import WebSocketComponent from './components/Websocket/main';
import { Block, GalioProvider } from 'galio-framework';
import { Images, materialTheme } from "./constants/";
import Theme from './constants/Theme';

function App(): JSX.Element {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory, loading, setLoading } = useAuth();
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.type !== 'cellular' && state.type !== 'wifi') {
            Alert.alert(
              "Needs Internet Connection",
              "Please turn on Cellular data or Wifi.",
              [{ text: "Confirm",
              onPress: () => {
                if (Platform.OS === 'ios') {
                    // iOS 설정 화면으로 이동
                    Linking.openURL('app-settings:');
                } else {
                  // 안드로이드 Wi-Fi 설정 화면으로 이동
                  IntentLauncher.startActivity({
                      action: 'android.settings.WIFI_SETTINGS',
                  });
                }
              } }],
              { cancelable: false }
            );
        }
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
        unsubscribe();
    };
  }, []);

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
      <StatusBar/>
      <LoginComponent/>
      {loading ? <LoaderComponent/>:<></> }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    height:"100%",
    backgroundColor: '#fff'
  },
  mainContent: {
    height: componentHeight
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
