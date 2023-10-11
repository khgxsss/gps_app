import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Timestamp } from '@react-native-firebase/firestore';

import {
  Container,
  Card,
  UserInfo,
  UserImg,
  UserName,
  UserInfoText,
  PostTime,
  PostText,
  PostImg,
  InteractionWrapper,
  Interaction,
  InteractionText,
  Divider
} from '../styles/FeedStyles';
import ProgressiveImage from './ProgressiveImage';
import { useAuth } from '../Navigation/AuthContext';

interface PostCardProps {
  item: {
    id: string;
    online: boolean;
    regTime: Timestamp;
    device: string;
    deviceImg?: string;
    userId: string;
  };
  onDelete: (id: string) => void;
  onPress: () => void;
  userData?: {
    fname?: string;
    lname?: string;
    userImg?: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({item, onDelete, onPress, userData}) => {

  const likeIcon = item.online ? 'heart' : 'heart-outline';
  const likeIconColor = item.online ? '#2e64e5' : '#333';
  const { activeTab, setActiveTab, fetchedWData, setFetchedWData, mapType, setMapType, user, setUser, handleSignIn, handleSignOut, MAP_TYPE, tabHistory, setTabHistory } = useAuth();

  return (
    <Card key={item.id}>
      <UserInfo>
        <UserImg
          source={{
            uri: userData
              ? userData.userImg ||
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
              : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
          }}
        />
        <UserInfoText>
          <TouchableOpacity onPress={onPress}>
            <UserName>
              {userData ? userData.fname || 'Test' : 'Test'}{' '}
              {userData ? userData.lname || 'User' : 'User'}
            </UserName>
          </TouchableOpacity>
          <PostTime>{item.regTime.toDate().toISOString()}</PostTime>
        </UserInfoText>
      </UserInfo>
      <PostText>{item.device}</PostText>
      {/* {item.postImg != null ? <PostImg source={{uri: item.postImg}} /> : <Divider />} */}
      {item.deviceImg != null ? (
        <ProgressiveImage
          defaultImageSource={require('../assets/default-img.jpg')}
          source={{uri: item.deviceImg}}
          style={{width: '100%', height: 250}}
          resizeMode="cover"
        />
      ) : (
        <Divider />
      )}

      <InteractionWrapper>
        <Interaction active={item.online}>
          <Ionicons name={likeIcon} size={25} color={likeIconColor} />
          <InteractionText active={item.online}>likeText</InteractionText>
        </Interaction>
        <Interaction>
          <Ionicons name="chatbubble-outline" size={25} />
          <InteractionText>commentText</InteractionText>
        </Interaction>
        <Interaction onPress={() => onDelete(item.id)}>
          <Ionicons name="md-trash-bin" size={25} />
        </Interaction>
      </InteractionWrapper>
    </Card>
  );
};

export default PostCard;
