/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  AppRegistry,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  PermissionsAndroid,
  View,
} from 'react-native';

// bottom Navigation
import Tabbar from './Navigation/TabBar';
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons'

// Components
import Todos from './Components/List/Todos';
import MapComponent from './Components/Map/main';
import LoginComponent from './Components/Login/main';
import ProfileComponent from './Components/Profile/main';

AppRegistry.registerComponent('MyAppName', () => Todos);

function App(): JSX.Element {

  const requestLocationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "위치 권한 필요",
                message: "이 앱은 위치 권한이 필요합니다.",
                buttonNeutral: "나중에",
                buttonNegative: "취소",
                buttonPositive: "확인"
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("permission ok");
        } else {
            console.log("permission not ok");
        }
    } catch (err) {
        console.warn(err);
    }
  };

  useEffect(()=>{
    requestLocationPermission();
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  const SAV_style = {
    flex: 1
  };

  // 사용자 상태 관리를 위한 useState 사용
  const [user, setUser] = useState('');

  // Tab Status
  const [activeTab, setActiveTab] = React.useState('Home');

  // Render Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return <Todos/>;
      case 'Map':
        return <MapComponent/>;
      case 'Profile':
        return <ProfileComponent userName={user}/>;
      default:
        return <></>;
    }
  };

  return (
    <SafeAreaView style={SAV_style}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <LoginComponent user={user} setUser={setUser}/>
      {renderTabContent()}
      <Tabbar
        tabs={tabs}
        tabBarContainerBackground='#b0caff'
        tabBarBackground='#ffffff'
        activeTabBackground='#a0ff99'
        labelStyle={{ color: '#949494', fontWeight: '500', fontSize: 12 }}
        onTabChange={(e) => setActiveTab(e.name)}
      />
    </SafeAreaView>
  );
}

const tabs = [
  {
    name: 'list',
    activeIcon: <Icon name="list-ul" color="#fff" size={25} />,
    inactiveIcon: <Icon name="list-ul" color="#949494" size={25} />
  },
  {
    name: 'Map',
    activeIcon: <Icon_MC name="ship-wheel" color="#fff" size={25} />,
    inactiveIcon: <Icon_MC name="ship-wheel" color="#949494" size={25} />
  },
  {
    name: 'Profile',
    activeIcon: <Icon name="user" color="#fff" size={25} />,
    inactiveIcon: <Icon name="user" color="#949494" size={25} />
  },

];


export default App;
