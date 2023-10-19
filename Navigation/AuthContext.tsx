import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents, User } from 'react-native-firebaseui-auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Dimensions } from 'react-native';
import { Coord } from 'react-native-nmap-fork1';

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
    setMapZoomLevelFirebase: () => void;
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
}

interface AuthProviderProps {
    children: ReactNode;
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

// only for dev
const test_data:DeviceDataType[] = [
  { deviceid: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 }, receivedtime: Date.now()+10000},
  { deviceid: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 }, receivedtime:Date.now() },
  { deviceid: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 }, receivedtime:Date.now() }
]

const default_user = {displayName:'',email:'',isNewUser:false,phoneNumber:'',photoURL:'',uid:'',providerId:'',creationTimestamp:0,lastSignInTimestamp:0}
export const { width, height } = Dimensions.get('window');
export const tabHeight = 65
export const componentHeight = height - tabHeight

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
          mapZoomLevel: 13
        });
      }else {
        await userDocRef.update({
          lastSignInTimestamp: signedInUser.lastSignInTimestamp,
        });
      }
      setDefaultMapZoomLevel(userDoc.data()?.mapZoomLevel,)
  
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

  const setMapZoomLevelFirebase = async () => {
    try {
      // Firestore에서 사용자 확인
      const userDocRef = firestore().collection('users').doc(user.uid);
  
      const userDoc = await userDocRef.get();
  
      // Map Zoom 갱신
      if (userDoc.exists) {
        await userDocRef.update({
          mapZoomLevel: defaultMapZoomLevel,
        });
      }
  
    } catch (err) {
      console.log(err);
    }
  };   

  return (
    <AuthContext.Provider value={
      { activeTab, setActiveTab, 
        fetchedWData, setFetchedWData, 
        mapType, setMapType, 
        user, setUser, 
        handleSignIn, handleSignOut, setMapZoomLevelFirebase,
        MAP_TYPE, 
        tabHistory, setTabHistory, 
        isWifiModalVisible, setWifiModalVisible, 
        isMapSettingsModalVisible, setMapSettingsModalVisible, 
        loading, setLoading, 
        defaultMapZoomLevel, setDefaultMapZoomLevel,
        cellularOn, setCellularOn,
        wifiOn, setWifiOn }
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
