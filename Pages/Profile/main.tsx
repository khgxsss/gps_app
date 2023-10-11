import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, View } from 'react-native';
import { Block, Button, Text, theme } from 'galio-framework';
import LinearGradient from 'react-native-linear-gradient';
import Icon_FA from 'react-native-vector-icons/FontAwesome';

import { Icon } from '../../components';
import { Images, materialTheme } from '../../constants';
import { HeaderHeight } from "../../constants/utils";

const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuth } from '../../Navigation/AuthContext';

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
  const [deleted, setDeleted] = useState(false);
  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE } = useAuth();

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
    <Block style={styles.profile}>
      <ImageBackground
        source={ Images.Profile }
        style={styles.profileContainer}
        imageStyle={styles.profileImage}>
        <Block flex style={styles.profileDetails}>
          <Block style = {styles.userImgBlock}>
            <Image
              style={styles.userImg}
              source={{uri: user.photoURL ? user.photoURL : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'}}
            />
          </Block>
          <Block style={styles.profileTexts}>
          <Text color="white" size={28} style={{ paddingBottom: 8 }}>{user.displayName}</Text>
              <Block row space="between">
                <Block row>
                  <Block middle style={styles.pro}>
                    <Text size={16} color="white">Pro</Text>
                  </Block>
                  <Text color="white" size={16} muted style={styles.seller}>User</Text>
                </Block>
                <Block>
                  <Text color={theme.COLORS?.MUTED} size={16}>
                    <Icon_FA name="map-marker" color={theme.COLORS?.MUTED} size={16} />
                    {` `} Seoul, KR
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
            <Text bold size={13} style={{marginBottom: 8}}>36</Text>
            <Text muted size={13}>Total Devices</Text>
          </Block>
          <Block middle>
            <Text bold size={13} style={{marginBottom: 8}} color={theme.COLORS?.PRIMARY}>5</Text>
            <Text muted size={13}>Online Devices</Text>
          </Block>
        </Block>
        <Block row space="between" style={{ marginTop: 16,paddingVertical: 16, alignItems: 'baseline' }}>
          <Text size={16}>Recently viewed</Text>
          <Button style={{backgroundColor:theme.COLORS?.MUTED, width:'auto', height:'auto'}} onPress={()=>{handleSignOut()}}>Logout</Button>
          <Text size={12} color={theme.COLORS?.PRIMARY} onPress={() => console.log('home')}>View All</Text>
        </Block>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Block row space="between" style={{ flexWrap: 'wrap' }} >
            {devices.map((device, imgIndex) => (
              <>
              <Text
                key={`key-${device}`}
                style={styles.thumb}>{device.device}</Text>
              </>
            ))}
          </Block>
        </ScrollView>
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  profile: {
    marginBottom: -HeaderHeight,
    height:'100%'
  },
  profileImage: {
    width: width,
    height: '100%',
  },
  profileContainer: {
    width: width,
    height: '50%',
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    paddingBottom: theme.SIZES.BASE * 6
  },
  userImgBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -theme.SIZES.BASE*13,
    zIndex:3
  },
  userImg: {
    height: 200,
    width: 200,
    borderRadius: 100
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
    zIndex: 3
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: theme.SIZES.BASE / 2,
    borderRadius: 4
  },
  seller: {
    marginRight: theme.SIZES.BASE / 2,
  },
  options: {
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 7,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    backgroundColor: '#fff',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
    height:'65%'
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 3,
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    position: 'absolute',
  },
});

export default ProfileComponent;
