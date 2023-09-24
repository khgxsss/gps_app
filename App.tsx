/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
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

// bottom Tabbar
import Tabbar from './Tabbar/TabBar';
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons'

// Components
import Todos from './Todos/Todos';

AppRegistry.registerComponent('MyAppName', () => Todos);

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

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  const SAV_style = {
    flex: 1,
    backgroundColor: isDarkMode ? '#000' : '#fff'
  };

  return (
    <SafeAreaView style={SAV_style}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Todos/>
      <Tabbar
        tabs={tabs}
        tabBarContainerBackground='#b0caff'
        tabBarBackground='#ffffff'
        activeTabBackground='#a0ff99'
        labelStyle={{ color: '#949494', fontWeight: '600', fontSize: 11 }}
        onTabChange={() => console.log('Tab changed')}
      />
    </SafeAreaView>
  );
}


export default App;
