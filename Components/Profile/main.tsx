import React from 'react';
import { View, Text } from 'react-native';

const ProfileComponent = ({userName}:{userName:string}) => {
  return (
    <View>
      <Text>Welcome, {userName}!!</Text>
    </View>
  );
};

export default ProfileComponent;
