import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Auth, { AuthEventEmitter, AuthEvents } from 'react-native-firebaseui-auth';

interface AuthContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
    mapType: number;
    setMapType: (value: number) => void;
    user: string;
    setUser: (value: string) => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:AuthProviderProps) => {
  const [user, setUser] = useState<string>('');
  const [activeTab, setActiveTab] = React.useState('Map');
  const [mapType, setMapType] = useState(MAP_TYPE.Basic); // used in MapComponent
  const [fetchedWData, setFetchedWData] = React.useState<object>({});

  useEffect(() => {
    const eventListener = AuthEventEmitter.addListener(
      AuthEvents.AUTH_STATE_CHANGED,
      event => {
        console.log(event.user)
        if (event.user) {
            setUser(event.user.displayName)
        }
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
      setUser(signedInUser.displayName);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(''); // After signing out, set the user to an empty string
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
