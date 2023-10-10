import React, {useState, useEffect, useContext} from 'react';
import Auth, { AuthEventEmitter, AuthEvents } from 'react-native-firebaseui-auth';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuth } from '../../Navigation/AuthContext';
import PostCard from '../../Components/PostCard';

interface deviceType {
  id: string;
  userId: string;
  userName: string;
  userImg: string;
  regTime: string;
  device: string;
  deviceImg: string;
  online: boolean;
}

const ProfileComponent = () => {
  const [devices, setDevices] = useState<deviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState<FirebaseFirestoreTypes.DocumentData|undefined>({});
  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE } = useAuth();

  const fetchDevices = async () => {
    try {
      const list: deviceType[] = [];

      await firestore()
        .collection('devices')
        .where('userId', '==', user)
        .orderBy('regTime', 'desc')
        .get()
        .then((querySnapshot) => {
          // console.log('Total Devices: ', querySnapshot.size);

          querySnapshot.forEach((doc) => {
            const {
              userId,
              device,
              deviceImg,
              regTime
            } = doc.data();
            list.push({
              id: doc.id,
              userId,
              userName: 'Test Name',
              userImg:
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
              regTime: regTime,
              device,
              deviceImg,
              online: false
            });
          });
        });

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
    .doc(user)
    .get()
    .then((documentSnapshot) => {
      if( documentSnapshot.exists ) {
        console.log('User Data', documentSnapshot.data());
        setUserData(documentSnapshot.data());
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
      showsVerticalScrollIndicator={false}>
      <Image
        style={styles.userImg}
        source={{uri: userData ? userData.userImg || 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg' : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'}}
      />
      <Text style={styles.userName}>{userData ? userData.fname || 'Test' : 'Test'} {userData ? userData.lname || 'User' : 'User'}</Text>
      {/* <Text>{route.params ? route.params.userId : user.uid}</Text> */}
      <Text style={styles.aboutUser}>
      {userData ? userData.about || 'No details added.' : ''}
      </Text>
      <View style={styles.userBtnWrapper}>
        <TouchableOpacity style={styles.userBtn} onPress={() => handleSignOut()}>
          <Text style={styles.userBtnTxt}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfoWrapper}>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoTitle}>{devices.length}</Text>
          <Text style={styles.userInfoSubTitle}>Total Devices</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoTitle}>100</Text>
          <Text style={styles.userInfoSubTitle}>Online Devices</Text>
        </View>
      </View>

      {devices.map((item) => (
        <PostCard key={item.id} item={item} onDelete={()=>handleDeleteDevice()} onPress={()=>(console.log('press1'))} userData={userData}/>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: '15%'
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileComponent;
