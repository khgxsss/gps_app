import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';

import { DeviceDataType, useAuth } from '../../Navigation/AuthContext';
import ActionButton from 'react-native-action-button-fork1';
import Theme from '../../Constants/Theme';
import WifiModalComponent from './wifiModal';
import Images from '../../Constants/Images';
import showExitAlert from '../../Components/ExitApp';

const ProfileComponent = () => {

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory,  isWifiModalVisible, setWifiModalVisible  } = useAuth();
  const [recentDeviceslength, setRecentDeviceslength] = useState<number>(0)
  
  useEffect(() => {
    const checkRecentDevices = () => {
        const twoMinutesInMillis = 120000; // 2 minutes in milliseconds

        // Filter the data to only include items where time_generation is within the last 2 minutes
        const recentDevices = fetchedWData && fetchedWData.filter(device => Date.now() - device.time_generation.time < twoMinutesInMillis);

        // Return the count of such devices
        if (recentDevices) setRecentDeviceslength(recentDevices.length);
    };
    // Initially check the recent devices
    checkRecentDevices();

    // Set an interval to check the recent devices every 3 seconds
    const intervalId = setInterval(checkRecentDevices, 3000); // 3 seconds

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [fetchedWData]);

  return (
    <View style={styles.profile}>
      <ImageBackground
        source={ Images.Profile }
        style={styles.profileContainer}
        imageStyle={styles.profileImage}>
        <View style={styles.profileDetails}>
          <View style={styles.profileTexts}>
          <View style = {styles.userImgBlock}>
            <Image
              style={styles.userImg}
              source={{uri: user.photoURL ? user.photoURL : Images.googleBasicProfile}}
            />
          </View>
          <Text style={{ paddingBottom: 8, fontSize:28, color:Theme.COLORS.WHITE }}>{user.displayName}</Text>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <View style={{flexDirection:'row'}}>
                  <View style={styles.pro}>
                    <Text style={{fontSize:16, color:Theme.COLORS.WHITE}}>Pro</Text>
                  </View>
                  <Text style={styles.seller}>User</Text>
                </View>
                <View>
                  <Text style={{color:Theme.COLORS.WHITE, fontSize:16}}>
                    <FontAwesome name="map-marker" color={Theme.COLORS.WHITE} size={16} />
                    {` `}
                    </Text>
                </View>
              </View>
            </View>
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)']} style={styles.gradient} />
        </View>
      </ImageBackground>
      <View style={styles.options}>
        <View style={{ padding: Theme.SIZES.BASE, flexDirection:'row', justifyContent:'space-between' }}>
          <View style={{justifyContent:'center', alignItems:'center'}}>
            <Text style={{marginBottom: 8, fontWeight:'bold', fontSize:13, color:Theme.COLORS.BLACK}}>{fetchedWData? fetchedWData.length:0}</Text>
            <Text style={{fontSize:13}}>Total Devices</Text>
          </View>
          <View style={{justifyContent:'center', alignItems:'center'}}>
            <Text style={{marginBottom: 8, fontWeight:'bold', fontSize:13, color:Theme.COLORS.RED}} >{recentDeviceslength}</Text>
            <Text style={{fontSize:13}}>Online Devices</Text>
          </View>
        </View>
        <View style={{ marginTop: 16,paddingVertical: 16, alignItems: 'baseline', flexDirection:'row', justifyContent:'space-between' }}>
          <Text style={{fontSize:16, color:Theme.COLORS.BLACK}}>Devices List</Text>
          {/* <Text style={{fontSize:13, color:Theme.COLORS.PRIMARY}} onPress={() => console.log('ViewAll')}>View All</Text> */}
        </View>
        <View style={styles.optionLine} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{justifyContent:'center', padding:4, width:'100%'}} >
            {fetchedWData&& fetchedWData.map((device, Index) => (
              <View key={Index} style={styles.textContainer}>
                <Text style={styles.thumb}>{device.buoy_id}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <ActionButton buttonColor={Theme.COLORS.SETINGS_BTN} style={styles.actionButton} renderIcon={active => (<Ionicons name="settings-sharp" color={Theme.COLORS.WHITE} size={25}/>)}>
        <ActionButton.Item buttonColor='#9b59b6' title='Wifi Settings' onPress={() => setWifiModalVisible(true)}>
            <MaterialCommunityIcons name="wifi-cog" color={'#fff'} size={25}/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#9b59b6' title='Logout' onPress={()=>{handleSignOut()}}>
            <MaterialCommunityIcons name="logout" color={'#fff'} size={25}/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#9b59b6' title='Exit' onPress={showExitAlert}>
            <MaterialCommunityIcons name="close-box-multiple-outline" color={'#fff'} size={25}/>
        </ActionButton.Item>
      </ActionButton>
      {
        isWifiModalVisible && <WifiModalComponent/>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    height: '100%',
  },
  profileImage: {
    height: '100%',
  },
  profileContainer: {
    height: '40%',
  },
  profileDetails: {
    flex: 1,
    paddingTop: Theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    paddingBottom: Theme.SIZES.BASE * 6
  },
  userImgBlock: {
    justifyContent:'center',
    alignItems: 'center'
  },
  userImg: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  profileTexts: {
    paddingHorizontal: Theme.SIZES.BASE * 2,
    paddingVertical: Theme.SIZES.BASE * 2,
    zIndex: 3
  },
  pro: {
    backgroundColor: Theme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: Theme.SIZES.BASE / 2,
    borderRadius: 4,
    justifyContent:'center',
    alignItems: 'center'
  },
  seller: {
    fontSize:16, 
    color:Theme.COLORS.WHITE,
    marginRight: Theme.SIZES.BASE / 2,
  },
  options: {
    padding: Theme.SIZES.BASE,
    marginHorizontal: Theme.SIZES.BASE,
    marginTop: -Theme.SIZES.BASE * 7,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    backgroundColor: '#f0f0f0',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
    height: '60%'
  },
  optionLine: { 
    height: 1, 
    backgroundColor: '#fff', 
    marginBottom:10
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: 4,
    margin: 4,
    backgroundColor:Theme.COLORS.ICON,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    borderColor: Theme.COLORS.WHITE,
    borderWidth: 2
  },
  thumb: {
    color:Theme.COLORS.WHITE
  },
  gradient: {
    zIndex: 3,
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    position: 'absolute',
  },
  actionButton: {
    zIndex: 3
  }
});

export default ProfileComponent;
