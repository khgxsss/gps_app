import React from 'react';
import { View, Text } from 'react-native';

const ProfileComponent = ({ user, activeTab, setActiveTab }: { user: any, activeTab: any, setActiveTab: any }) => {
  return (
    <View>
      <Text>Welcome, {user}!!</Text>
    </View>
  );
};

export default ProfileComponent;
