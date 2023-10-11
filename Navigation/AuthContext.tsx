import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents, User } from 'react-native-firebaseui-auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface AuthContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
    mapType: number;
    setMapType: (value: number) => void;
    user: User;
    setUser: (value: User) => void;
    fetchedWData: object;
    setFetchedWData: (value: object) => void;
    handleSignIn: () => void;
    handleSignOut: () => void;
    MAP_TYPE: object;
}

interface AuthProviderProps {
    children: ReactNode;
}

const MAP_TYPE = {
    Basic: 0,
    TERRAIN: 4,
    SATELLITE: 2,
    HYBRID: 3,
    NAVI: 1
};

const default_user = {displayName:'',email:'',isNewUser:false,phoneNumber:'',photoURL:'',uid:'',providerId:'',creationTimestamp:0,lastSignInTimestamp:0}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
  const [user, setUser] = useState<User>(default_user);
  const [activeTab, setActiveTab] = React.useState('Map');
  const [mapType, setMapType] = useState(MAP_TYPE.Basic); // used in MapComponent
  const [fetchedWData, setFetchedWData] = React.useState<object>({});

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
  
      // Firestore에서 사용자 확인
      const userDocRef = firestore().collection('users').doc(signedInUser.uid);
  
      const userDoc = await userDocRef.get();
      console.log(userDoc.data())
  
      // 사용자가 데이터베이스에 없으면 추가, 있으면 타임스탬프 갱신
      if (!userDoc.exists) {
        await userDocRef.set({
          about: '', // 기본값으로 빈 문자열 사용
          devices: [], // 기본값으로 빈 배열 사용
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
    <AuthContext.Provider value={{ activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE }}>
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
