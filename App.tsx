import React, { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
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

function App(): JSX.Element {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory, loading, setLoading, cellularOn, setCellularOn, wifiOn, setWifiOn, appDimension, isWifiModalVisible } = useAuth();
  const [isModalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isInternetReachable) {
        setModalVisible(false);
        switch (state.type) {
          case 'wifi':
            setWifiOn(true)
            setCellularOn(false)
            break
          case 'cellular':
            setCellularOn(true)
            setWifiOn(false)
            break
          default:
            setCellularOn(false)
            setWifiOn(false)
            break;
        }
      }else {
        setWifiOn(false)
        setCellularOn(false)
        setModalVisible(true);
      }
      if (isWifiModalVisible) {
        if (state.type !== 'wifi') {
          setModalVisible(true);
        }else {
          setModalVisible(false)
        }
      }
    });

    // ������Ʈ �𸶿�Ʈ �� �̺�Ʈ ������ ����
    return () => {
        unsubscribe();
    };
  }, []);

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
        // iOS ���� ȭ������ �̵�
        Linking.openURL('app-settings:');
    } else {
      // �ȵ���̵� Wi-Fi ���� ȭ������ �̵�
      IntentLauncher.startActivity({
          action: 'android.settings.WIFI_SETTINGS',
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <></>;
      case 'Map':
        return <MapComponent/>;
      case 'Profile':
        return <ProfileComponent/>;
      default:
        return <></>;
    }
  };

  
// Login dev������ ��ȯ
  return (
    <View style={{...styles.safeAreaView, height: appDimension.appHeight}}>
      <WebSocketComponent/>
      <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
      >
          <View style={{ width:'100%', height:'100%', position:'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
              <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                  <Text>{!isWifiModalVisible ? 'Needs Internet Connection':'Needs wifi Connection'}</Text>
                  <Text>{!isWifiModalVisible ? 'Please turn on Cellular data or Wifi.':'Please turn on Wifi.'}{'\n'}</Text>
                  <Button title="Go to Settings" onPress={handleOpenSettings} color={Theme.COLORS.BUTTON_COLOR}/>
              </View>
          </View>
      </Modal>
      <LoginComponent/>
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
