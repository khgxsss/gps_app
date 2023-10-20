import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents, User } from 'react-native-firebaseui-auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Dimensions } from 'react-native';
import { Coord } from 'react-native-nmap-fork1';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

interface AuthContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
    mapType: number;
    setMapType: (value: number) => void;
    user: User;
    setUser: (value: User) => void;
    fetchedWData: DeviceDataType[];
    setFetchedWData: (value: DeviceDataType[]) => void;
    handleSignIn: () => void;
    handleSignOut: () => void;
    setMapLocationSettingsFirebase: () => void;
    MAP_TYPE: object;
    tabHistory: number[];
    setTabHistory:(value: number[]) => void;
    isWifiModalVisible: boolean;
    setWifiModalVisible: (value: boolean) => void;
    isMapSettingsModalVisible: boolean;
    setMapSettingsModalVisible: (value: boolean) => void;
    loading: boolean;
    setLoading: (value: boolean) => void;
    defaultMapZoomLevel: number;
    setDefaultMapZoomLevel: (value: number) => void;
    wifiOn: boolean;
    setWifiOn: (value: boolean) => void;
    cellularOn: boolean;
    setCellularOn: (value: boolean) => void;
    appDimension: appDimensionType;
    locationSaved: locationSavedType;
    setLocationSaved: (value: locationSavedType) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface appDimensionType {
  appWidth: number;
  appHeight: number;
  x?: number;
  y?: number;
  componentHeight:number;
  tabHeight:number;
}

interface locationSavedType extends Coord  {
  mapZoomLevel: number;
}

interface deviceType {
  userId: string;
  userName: string;
  regTime: string;
  device: string;
  deviceImg: string;
  online: boolean;
}

export interface DeviceDataType {
  deviceid: string;
  location: Coord;
  receivedtime: number;
};

export interface FetchedDataType {
  shiplocation: Coord;
  device: DeviceDataType
}

export interface Region {
  latitude: number;
  longitude: number;
  zoom: number;
  //������ ������ ������ ���� ��ǥ���� ��ȯ�մϴ�. ��ǥ���� �� ���� ��ǥ�� ������ �簢������ ǥ���˴ϴ�. ��, ��ȯ�Ǵ� �迭�� ũ��� 5�̸�, ù ��° ���ҿ� ������ ���Ұ� ������ ������ ����ŵ�ϴ�. ������ �е��� ��� 0�̸� getCoveringRegion()�� ������ �簢����, ������ �е��� �����Ǿ� ������ getCoveringRegion()���� ������ �е��� ������ �簢���� ��ȯ�˴ϴ�.
  contentRegion: [Coord, Coord, Coord, Coord, Coord];
  // ������ �е��� ������ ������ �� ��ü ������ ���� ��ǥ���� ��ȯ�մϴ�. ��ǥ���� �� ���� ��ǥ�� ������ �簢������ ǥ���˴ϴ�. ��, ��ȯ�Ǵ� �迭�� ũ��� 5�̸�, ù ��° ���ҿ� ������ ���Ұ� ������ ������ ����ŵ�ϴ�.
  coveringRegion: [Coord, Coord, Coord, Coord, Coord]; 
}

const MAP_TYPE = {
    BASIC: 0,
    TERRAIN: 4,
    SATELLITE: 2,
    HYBRID: 3,
    NAVI: 1
};

const initialAppDimension: appDimensionType = {
  appWidth: 0,
  appHeight: 0,
  x: 0,
  y: 0,
  tabHeight: 65,
  componentHeight: 0
};

const initialSavedLocation: locationSavedType = {latitude: 37.35882350130591, longitude: 127.10469231924353, mapZoomLevel: 13}

// only for dev
const test_data:DeviceDataType[] = [
  { deviceid: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 }, receivedtime: Date.now()+10000},
  { deviceid: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 }, receivedtime:Date.now() },
  { deviceid: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 }, receivedtime:Date.now() }
]

const default_user = {displayName:'',email:'',isNewUser:false,phoneNumber:'',photoURL:'',uid:'',providerId:'',creationTimestamp:0,lastSignInTimestamp:0}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
  const [user, setUser] = useState<User>(default_user);
  const [activeTab, setActiveTab] = React.useState('Map');
  const [mapType, setMapType] = useState(MAP_TYPE.BASIC); // used in MapComponent
  const [fetchedWData, setFetchedWData] = React.useState<DeviceDataType[]>(test_data);
  const [tabHistory, setTabHistory] = useState<number[]>([1])
  const [isWifiModalVisible, setWifiModalVisible] = useState(false);
  const [isMapSettingsModalVisible, setMapSettingsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultMapZoomLevel, setDefaultMapZoomLevel] = useState<number>(13);
  const [wifiOn, setWifiOn] = useState<boolean>(false);
  const [cellularOn, setCellularOn] = useState<boolean>(false);
  const [appDimension, setAppDimension] = useState<appDimensionType>(initialAppDimension);
  const [locationSaved, setLocationSaved] = useState<locationSavedType>(initialSavedLocation) // firebase �̿�

  const safeareadimension = useSafeAreaFrame();
  
  const appDimensionCache = useMemo(() => ({
      appWidth: safeareadimension.width,
      appHeight: safeareadimension.height,
      x: safeareadimension.x,
      y: safeareadimension.y,
      tabHeight: 65,
      componentHeight: safeareadimension.height - 65
  }), [safeareadimension]);
  
  useEffect(() => {
      // appDimension�� appDimensionCache�� ���� ���� ����Ǿ����� Ȯ��
      const hasChanged = Object.entries(appDimensionCache).some(([key, val]) => 
          appDimension[key as keyof appDimensionType] !== val
      );
      if (hasChanged) {
          setAppDimension(appDimensionCache);
      }
  }, [appDimensionCache, appDimension]);

  useEffect(() => {

    const eventListener = AuthEventEmitter.addListener(
      AuthEvents.AUTH_STATE_CHANGED,
      event => {
        console.log(event)
        // if (event.user) {
        //   setUser(event.user)
        // }
      }
    );
    return () => {
      eventListener.remove();
    };
  }, []);

  const config = {
    providers: ['google'],
    tosUrl: 'https://example.com/tos.htm',
    privacyPolicyUrl: 'https://example.com/privacypolicy.htm',
  };

  const handleSignIn = async () => {
    try {
      const signedInUser = await Auth.signIn(config);
      setUser(signedInUser);
  
      // Firestore���� ����� Ȯ��
      const userDocRef = firestore().collection('users').doc(signedInUser.uid);
  
      const userDoc = await userDocRef.get();
  
      // ����ڰ� �����ͺ��̽��� ������ �߰�, ������ Ÿ�ӽ�����, Map Zoom ����
      if (!userDoc.exists) {
        await userDocRef.set({
          about: '', // �⺻������ �� ���ڿ� ���
          devices: [], // �⺻������ �� �迭 ���
          name: signedInUser.displayName || '',
          email: signedInUser.email,
          lastSignInTimestamp: signedInUser.lastSignInTimestamp,
          lastLocation: {latitude: 37.35882350130591, longitude: 127.10469231924353, mapZoomLevel: 13}
        });
      }else {
        await userDocRef.update({
          lastSignInTimestamp: signedInUser.lastSignInTimestamp,
        });
      }
      setLocationSaved(userDoc.data()?.lastLocation)
      setDefaultMapZoomLevel(userDoc.data()?.lastLocation.mapZoomLevel,)
  
    } catch (err) {
      console.log(err);
    }
  };  

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(default_user); // After signing out, set the user to an empty string
      setActiveTab('Map')
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleGetCurrentUser = async () => {
    try {
      const currentUser = await Auth.getCurrentUser();
      console.log(currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleDeleteUser = async () => {
    try {
      const result = await Auth.deleteUser();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserInfo = async () => {
    try {
      const signedInUser = await Auth.signIn(config);
      setUser(signedInUser);
  
      // Firestore���� ����� Ȯ��
      const userDocRef = firestore().collection('users').doc(signedInUser.uid);
  
      const userDoc = await userDocRef.get();
      console.log(userDoc.data())
  
    } catch (err) {
      console.log(err);
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

  const setMapLocationSettingsFirebase = async () => {
    try {
      // Firestore���� ����� Ȯ��
      const userDocRef = firestore().collection('users').doc(user.uid);
  
      const userDoc = await userDocRef.get();
  
      // Map Zoom ����
      if (userDoc.exists) {
        await userDocRef.update({
          lastLocation: locationSaved,
        });
      }
  
    } catch (err) {
      console.log(err);
    }
  };

  // not for use
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

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider value={
      { activeTab, setActiveTab, 
        fetchedWData, setFetchedWData, 
        mapType, setMapType, 
        user, setUser, 
        handleSignIn, handleSignOut, setMapLocationSettingsFirebase,
        MAP_TYPE, 
        tabHistory, setTabHistory, 
        isWifiModalVisible, setWifiModalVisible, 
        isMapSettingsModalVisible, setMapSettingsModalVisible, 
        loading, setLoading, 
        defaultMapZoomLevel, setDefaultMapZoomLevel,
        cellularOn, setCellularOn,
        wifiOn, setWifiOn,
        appDimension,
        locationSaved, setLocationSaved }
      }>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
