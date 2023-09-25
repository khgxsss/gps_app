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
  View,
} from 'react-native';

// bottom Navigation
import Tabbar from './Navigation/TabBar';
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons'

// Components
import Todos from './Components/Todos/Todos';
import MapMainComponent from './Components/Maps/main';
import LoginComponent from './Components/Login/main';

AppRegistry.registerComponent('MyAppName', () => Todos);

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  const SAV_style = {
    flex: 1,
    backgroundColor: isDarkMode ? '#000' : '#fff'
  };

  // 사용자 상태 관리를 위한 useState 사용
  const [user, setUser] = useState('');

  // Tab Status
  const [activeTab, setActiveTab] = React.useState('Home');

  // Render Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <Text>Home</Text>;
      case 'list':
        return <Todos/>;
      case 'Map':
        return <MapMainComponent/>;
      case 'Notification':
        return <Text>Notification Content</Text>;
      case 'Profile':
        return <Text>Profile Content</Text>;
      default:
        return <Todos />;
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
        labelStyle={{ color: '#949494', fontWeight: '600', fontSize: 11 }}
        onTabChange={(e) => setActiveTab(e.name)}
      />
    </SafeAreaView>
  );
}

const tabs = [
  {
    name: 'Home',
    activeIcon: <Icon name="home" color="#fff" size={25} />,
    inactiveIcon: <Icon name="home" color="#949494" size={25} />
  },
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
    name: 'Notification',
    activeIcon: <Icon name="bell" color="#fff" size={25} />,
    inactiveIcon: <Icon name="bell" color="#949494" size={25} />
  },
  {
    name: 'Profile',
    activeIcon: <Icon name="user" color="#fff" size={25} />,
    inactiveIcon: <Icon name="user" color="#949494" size={25} />
  },

];


export default App;
