import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View } from 'react-native';
import { Block, Button, Text, theme } from 'galio-framework';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome,Ionicons,MaterialCommunityIcons } from '../../Components/IconSets';

import { Images, materialTheme } from '../../constants';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { height, useAuth, width } from '../../Navigation/AuthContext';
import ActionButton from 'react-native-action-button-fork1';
import Theme from '../../Constants/Theme';
import SyncModalComponent from './syncModal';

const thumbMeasure = (width - 48 - 32) / 3;

interface deviceType {
  userId: string;
  userName: string;
  regTime: string;
  device: string;
  deviceImg: string;
  online: boolean;
}

const ProfileComponent = () => {
  const [devices, setDevices] = useState<deviceType[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory,  isModalVisible, setModalVisible  } = useAuth();

  const fetchDevices = async () => {
    try {
      const list: deviceType[] = [];

      await firestore()
        .collection('devices')
        .where('userId', '==', user.uid)
        .orderBy('regTime', 'desc')
        .get()
        .then((querySnapshot) => {
          // console.log('Total Devices: ', querySnapshot.size);

          querySnapshot.forEach((doc) => {
            const {
              userId,
              device,
              deviceImg,
              regTime,
              userName,
            } = doc.data();
            list.push({
              userId,
              userName: 'Test Name',
              regTime: regTime,
              device,
              deviceImg,
              online: false
            });
          });
        });
      console.log(list)
      setDevices(list);

      if (loading) {
        setLoading(false);
      }

      console.log('Devices: ', devices);
    } catch (e) {
      console.log(e);
    }
  };

  const getUser = async() => {
    await firestore()
    .collection('users')
    .doc(user.uid)
    .get()
    .then((documentSnapshot) => {
      if( documentSnapshot.exists ) {
        console.log('User Data', documentSnapshot.data());
      }
    })
  }

  const handleDeleteDevice = () => {
    console.log("handle delete device")
  }

  useEffect(() => {
    getUser();
    fetchDevices();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <View style={styles.profile}>
      <ImageBackground
        source={ Images.Profile }
        style={styles.profileContainer}
        imageStyle={styles.profileImage}>
        <Block flex style={styles.profileDetails}>
          <Block style={styles.profileTexts}>
          <Block style = {styles.userImgBlock}>
            <Image
              style={styles.userImg}
              source={{uri: user.photoURL ? user.photoURL : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'}}
            />
          </Block>
          <Text color="white" size={28} style={{ paddingBottom: 8 }}>{user.displayName}</Text>
              <Block row space="between">
                <Block row>
                  <Block middle style={styles.pro}>
                    <Text size={16} color="white">Pro</Text>
                  </Block>
                  <Text color="white" size={16} muted style={styles.seller}>User</Text>
                </Block>
                <Block>
                  <Text color={theme.COLORS?.NEUTRAL} size={16}>
                    <FontAwesome name="map-marker" color={theme.COLORS?.NEUTRAL} size={16} />
                    {` `} KR
                    </Text>
                </Block>
              </Block>
            </Block>
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)']} style={styles.gradient} />
        </Block>
      </ImageBackground>
      <Block style={styles.options}>
        <Block row space="between" style={{ padding: theme.SIZES?.BASE, }}>
          <Block middle>
            <Text bold size={13} color={theme.COLORS?.BLACK} style={{marginBottom: 8}}>36</Text>
            <Text muted size={13}>Total Devices</Text>
          </Block>
          <Block middle>
            <Text bold size={13} style={{marginBottom: 8}} color={theme.COLORS?.PRIMARY}>5</Text>
            <Text muted size={13}>Online Devices</Text>
          </Block>
        </Block>
        <Block row space="between" style={{ marginTop: 16,paddingVertical: 16, alignItems: 'baseline' }}>
          <Text size={16} color={theme.COLORS?.BLACK}>Recently updated (24hours)</Text>
          <Text size={12} color={theme.COLORS?.PRIMARY} onPress={() => console.log('home')}>View All</Text>
        </Block>
        <View style={styles.optionLine} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Block row >
            {devices.map((device, Index) => (
              <Block key={Index} style={styles.textContainer}>
                <Text style={styles.thumb}>{device.device}</Text>
              </Block>
            ))}
          </Block>
        </ScrollView>
      </Block>
      <ActionButton buttonColor={Theme.COLORS.LABEL} style={styles.actionButton} renderIcon={active => (<Ionicons name="settings-sharp" color={theme.COLORS?.WHITE} size={25}/>)}>
        <ActionButton.Item buttonColor='#9b59b6' title='Wifi Settings' onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="wifi-cog" color={'#fff'} size={25}/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#9b59b6' title='Logout' onPress={()=>{handleSignOut()}}>
            <MaterialCommunityIcons name="logout" color={'#fff'} size={25}/>
        </ActionButton.Item>
      </ActionButton>
      <SyncModalComponent/>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    height:'100%'
  },
  profileImage: {
    height: '100%',
  },
  profileContainer: {
    height: '40%',
  },
  profileDetails: {
    paddingTop: theme?.SIZES?.BASE ? theme.SIZES.BASE * 4 : 0,
    justifyContent: 'flex-end',
    paddingBottom: theme?.SIZES?.BASE ? theme.SIZES.BASE * 6 : 0,
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
    paddingHorizontal: theme?.SIZES?.BASE ? theme.SIZES.BASE * 2 : 0,
    paddingVertical: theme?.SIZES?.BASE ? theme.SIZES.BASE * 2 : 0,
    zIndex: 3
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: theme?.SIZES?.BASE ? theme.SIZES.BASE / 2 : 0,
    borderRadius: 4
  },
  seller: {
    marginRight: theme?.SIZES?.BASE ? theme.SIZES.BASE / 2 : 0,
  },
  options: {
    position:'relative',
    padding: theme?.SIZES?.BASE ? theme.SIZES.BASE : 0,
    marginHorizontal: theme?.SIZES?.BASE ? theme.SIZES.BASE : 0,
    marginTop: theme?.SIZES?.BASE ? -theme.SIZES.BASE * 7 : 0,
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
    marginVertical: 4,
    padding: 20,
    marginTop: 10,
    margin: 10,
    marginBottom: 10,
    backgroundColor:Theme.COLORS.SWITCH_ON,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    opacity: 0.9,
    borderBlockColor: 'black',
    borderColor: 'black',
    borderWidth: 2
  },
  thumb: {
    color:theme.COLORS?.WHITE
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
    position:'absolute',
    marginBottom: 80,
    zIndex: 3
  }
});

export default ProfileComponent;
