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
    MAP_TYPE: object;
    tabHistory: number[];
    setTabHistory:(value: number[]) => void;
    isModalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    loading: boolean;
    setLoading: (value: boolean) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

export interface DeviceDataType {
  deviceid: string;
  location: Coord;
};

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
    Basic: 0,
    TERRAIN: 4,
    SATELLITE: 2,
    HYBRID: 3,
    NAVI: 1
};

// only for dev
const test_data = [
  { deviceid: "40ca63fffe1deca5", location: { latitude: 36.4383755, longitude: 127.4248978 } },
  { deviceid: "40ca63fffe1deca6", location: { latitude: 36.4335753, longitude: 127.4028976 } },
  { deviceid: "40ca63fffe1deca7", location: { latitude: 36.4235753, longitude: 127.4428976 } }
]

const default_user = {displayName:'',email:'',isNewUser:false,phoneNumber:'',photoURL:'',uid:'',providerId:'',creationTimestamp:0,lastSignInTimestamp:0}
export const { width, height } = Dimensions.get('window');
export const tabHeight = 65
export const componentHeight = height - tabHeight

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
  const [user, setUser] = useState<User>(default_user);
  const [activeTab, setActiveTab] = React.useState('Map');
  const [mapType, setMapType] = useState(MAP_TYPE.Basic); // used in MapComponent
  const [fetchedWData, setFetchedWData] = React.useState<DeviceDataType[]>(test_data);
  const [tabHistory, setTabHistory] = useState<number[]>([1])
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      console.log(signedInUser)
      setUser(signedInUser);
  
      // Firestore���� ����� Ȯ��
      const userDocRef = firestore().collection('users').doc(signedInUser.uid);
  
      const userDoc = await userDocRef.get();
      console.log(userDoc.data())
  
      // ����ڰ� �����ͺ��̽��� ������ �߰�, ������ Ÿ�ӽ����� ����
      if (!userDoc.exists) {
        await userDocRef.set({
          about: '', // �⺻������ �� ���ڿ� ���
          devices: [], // �⺻������ �� �迭 ���
          name: signedInUser.displayName || '',
          email: signedInUser.email,
          lastSignInTimestamp: signedInUser.lastSignInTimestamp
        });
      }else {
        await userDocRef.set({
          about: userDoc.data()?.about,
          devices: userDoc.data()?.devices,
          name: userDoc.data()?.name,
          email: userDoc.data()?.email,
          lastSignInTimestamp: signedInUser.lastSignInTimestamp
        });
      }
  
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

  return (
    <AuthContext.Provider value={{ activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory, isModalVisible, setModalVisible, loading, setLoading }}>
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
