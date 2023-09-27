import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import Tabbar from './Navigation/TabBar';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons';
import Todos from './Components/Analytics/Todos';
import MapComponent from './Components/Map/main';
import LoginComponent from './Components/Login/main';
import ProfileComponent from './Components/Profile/main';
import WebSocketComponent from './Components/Websocket/main';

const test_data = [
  { deviceid: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 } },
  { deviceid: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 } },
  { deviceid: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 } }
]

function App(): JSX.Element {

  const [user, setUser] = useState('');
  const [activeTab, setActiveTab] = React.useState('Map');
  const [patchedData, setPatchedData] = React.useState<object>({});
  const [mapType, setMapType] = useState(MAP_TYPE.Basic); // used in MapComponent

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Todos user={user} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      case 'Map':
        return <MapComponent mapType={mapType} setMapType={setMapType} MAP_TYPE={MAP_TYPE} patchedData={test_data}/>;
      case 'Profile':
        return <ProfileComponent user={user} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      default:
        return <></>;
    }
  };
// Login dev용으로 전환
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar/>
      {/* <LoginComponent user={user} setUser={setUser} activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      {
        !user ? (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    height:"100%"
  },
  mainContent: {
    marginBottom: 65
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

const MAP_TYPE = {
  Basic: 0,
  TERRAIN: 4,
  SATELLITE: 2,
  HYBRID: 3,
  NAVI: 1
};

export default App;
