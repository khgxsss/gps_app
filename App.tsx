import React, { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from './Components/IconSets';

import { AuthProvider, useAuth } from './Navigation/AuthContext';
import IntentLauncher from 'react-native-intent-launcher-fork1';

import Tabbar from './Navigation/TabBar';
import Todos from './Pages/Analytics/Todos';
import MapComponent from './Pages/Map/main';
import LoginComponent from './Pages/Login/main';
import ProfileComponent from './Pages/Profile/main';
import WebSocketComponent from './Components/Websocket/main';
import Theme from './Constants/Theme';
import LoaderComponent from './Components/Loader';

function App(): JSX.Element {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory, loading, setLoading, cellularOn, setCellularOn, wifiOn, setWifiOn, appDimension } = useAuth();
  
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
        }else {
          console.log(state)
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
    <View style={{...styles.safeAreaView, height: appDimension.appHeight}}>
      <LoginComponent/>
      {loading ? <LoaderComponent/>:<></> }
      {
        user.uid ? (
          <>
            <View style={{...styles.mainContent, height:appDimension.componentHeight}}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff'
  },
  mainContent: {
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
    <SafeAreaProvider>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default AppWrapper;
