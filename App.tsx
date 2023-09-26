import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import Tabbar from './Navigation/TabBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon_MC from 'react-native-vector-icons/MaterialCommunityIcons';
import Todos from './Components/List/Todos';
import MapComponent from './Components/Map/main';
import LoginComponent from './Components/Login/main';
import ProfileComponent from './Components/Profile/main';

function App(): JSX.Element {

  const [user, setUser] = useState('');
  const [activeTab, setActiveTab] = React.useState('Map');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'List':
        return <Todos user={user} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      case 'Map':
        return <MapComponent />;
      case 'Profile':
        return <ProfileComponent user={user} activeTab={activeTab} setActiveTab={setActiveTab}/>;
      default:
        return <></>;
    }
  };
// Login dev용으로 전환
//   return (
//     <SafeAreaView style={styles.safeAreaView}>
//       <StatusBar/>
//       <LoginComponent user={user} setUser={setUser} activeTab={activeTab} setActiveTab={setActiveTab} />
//       {
//         user ? (
//           <>
//             <View style={styles.mainContent}>
//               {renderTabContent()}
//             </View>
//             <Tabbar
//               tabs={tabs}
//               tabBarContainerBackground='#b0caff'
//               tabBarBackground='#ffffff'
//               activeTabBackground='#a0ff99'
//               labelStyle={styles.labelStyle}
//               onTabChange={(e) => setActiveTab(e.name)}
//               defaultActiveTabIndex={1}
//             />
//           </>
//         ):(
//           <></>
//         )
        
//       }
//     </SafeAreaView>
//   );
// }

return (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar/>
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
    name: 'List',
    activeIcon: <Icon name="list-ul" color="#fff" size={25} />,
    inactiveIcon: <Icon name="list-ul" color="#949494" size={25} />,
  },
  {
    name: 'Map',
    activeIcon: <Icon_MC name="ship-wheel" color="#fff" size={25} />,
    inactiveIcon: <Icon_MC name="ship-wheel" color="#949494" size={25} />,
  },
  {
    name: 'Profile',
    activeIcon: <Icon name="user" color="#fff" size={25} />,
    inactiveIcon: <Icon name="user" color="#949494" size={25} />,
  },
];

export default App;
