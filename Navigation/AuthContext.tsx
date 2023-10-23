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
    seeAllDevices: boolean;
    setSeeAllDevices: (value: boolean) => void;
    seeDistanceLines: boolean,
    setSeeDistanceLines: (value: boolean) => void;
    serverLoginInput: serverLoginInputType
    setServerLoginInput: (value: serverLoginInputType) => void;
}

interface serverLoginInputType {
  ip:string;
  port:number,
  password:string;
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
  buoy_id: string;
  location: Coord;
  time_generation: {
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
    seconds: number,
    time: number,
  };
  status?: string;
};

export interface FetchedDataType {
  shiplocation: Coord;
  device: DeviceDataType
}

export interface Region {
  latitude: number;
  longitude: number;
  zoom: number;
  //지도의 콘텐츠 영역에 대한 좌표열을 반환합니다. 좌표열은 네 개의 좌표로 구성된 사각형으로 표현됩니다. 단, 반환되는 배열의 크기는 5이며, 첫 번째 원소와 마지막 원소가 동일한 지점을 가리킵니다. 콘텐츠 패딩이 모두 0이면 getCoveringRegion()과 동일한 사각형이, 콘텐츠 패딩이 지정되어 있으면 getCoveringRegion()에서 콘텐츠 패딩을 제외한 사각형이 반환됩니다.
  contentRegion: [Coord, Coord, Coord, Coord, Coord];
  // 콘텐츠 패딩을 포함한 지도의 뷰 전체 영역에 대한 좌표열을 반환합니다. 좌표열은 네 개의 좌표로 구성된 사각형으로 표현됩니다. 단, 반환되는 배열의 크기는 5이며, 첫 번째 원소와 마지막 원소가 동일한 지점을 가리킵니다.
  coveringRegion: [Coord, Coord, Coord, Coord, Coord]; 
}

const MAP_TYPE = {
    BASIC: 0,
    TERRAIN: 4,
    SATELLITE: 2,
    HYBRID: 3,
    NAVI: 1
};

const initialServerLoginInput: serverLoginInputType = {
  ip:'192.168.0.1',
  port:12345,
  password:'123'
}

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
const now = new Date();
const secondsSinceMidnight = ((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds());
console.log('test_data',secondsSinceMidnight)
console.log
const test_data:DeviceDataType[] = [
  { buoy_id: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 }, time_generation:{year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate(),seconds:secondsSinceMidnight+10, time:Date.now()}},
  { buoy_id: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 }, time_generation:{year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate(),seconds:secondsSinceMidnight+5, time:Date.now()} },
  { buoy_id: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 }, time_generation:{year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate(),seconds:secondsSinceMidnight, time:Date.now()} }
]

const default_user = {displayName:'',email:'',isNewUser:false,phoneNumber:'',photoURL:'',uid:'',providerId:'',creationTimestamp:0,lastSignInTimestamp:0}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
  const [user, setUser] = useState<User>(default_user);
  const [activeTab, setActiveTab] = React.useState('Map');
  const [mapType, setMapType] = useState(MAP_TYPE.BASIC); // used in MapComponent
  const [fetchedWData, setFetchedWData] = React.useState<DeviceDataType[]>();
  const [tabHistory, setTabHistory] = useState<number[]>([1])
  const [isWifiModalVisible, setWifiModalVisible] = useState(false);
  const [isMapSettingsModalVisible, setMapSettingsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultMapZoomLevel, setDefaultMapZoomLevel] = useState<number>(13);
  const [wifiOn, setWifiOn] = useState<boolean>(false);
  const [cellularOn, setCellularOn] = useState<boolean>(false);
  const [appDimension, setAppDimension] = useState<appDimensionType>(initialAppDimension);
  const [locationSaved, setLocationSaved] = useState<locationSavedType>(initialSavedLocation); // firebase 이용
  const [seeAllDevices, setSeeAllDevices] = useState<boolean>(false);
  const [seeDistanceLines, setSeeDistanceLines] = useState<boolean>(false);
  const [serverLoginInput, setServerLoginInput] = useState<serverLoginInputType>(initialServerLoginInput)

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
      // appDimension과 appDimensionCache의 실제 값이 변경되었는지 확인
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
  
      // Firestore에서 사용자 확인
      const userDocRef = firestore().collection('users').doc(signedInUser.uid);
  
      const userDoc = await userDocRef.get();
  
      // 사용자가 데이터베이스에 없으면 추가, 있으면 타임스탬프, Map Zoom 갱신
      if (!userDoc.exists) {
        await userDocRef.set({
          about: '', // 기본값으로 빈 문자열 사용
          devices: [], // 기본값으로 빈 배열 사용
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
  
      // Firestore에서 사용자 확인
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
      // Firestore에서 사용자 확인
      const userDocRef = firestore().collection('users').doc(user.uid);
  
      const userDoc = await userDocRef.get();
  
      // Map Zoom 갱신
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
        locationSaved, setLocationSaved,
        seeAllDevices, setSeeAllDevices,
        seeDistanceLines, setSeeDistanceLines,
        serverLoginInput, setServerLoginInput }
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
