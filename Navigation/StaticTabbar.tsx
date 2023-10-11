import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Text,
  TextStyle,
  I18nManager,
} from 'react-native';

import { TabsType } from './TabBar';
let { width } = Dimensions.get('window');

interface Props {
  value?: Animated.AnimatedValue;
  tabs: Array<TabsType>;
  onTabChange?: (tab: TabsType) => void;
  labelStyle?: TextStyle;
  activeTabBackground?: string;
  Hvalue?: number;
  containerWidth?: number;
  defaultActiveTabIndex?: number;
  transitionSpeed?: number;
}

const StaticTabbar: React.FC<Props> = ({
  value,
  tabs,
  onTabChange,
  labelStyle,
  activeTabBackground,
  containerWidth,
  defaultActiveTabIndex = 0,
  transitionSpeed,
}) => {
  const valuesRef = useRef(
    tabs.map((tab, index) => 
      new Animated.Value(index === defaultActiveTabIndex ? 1 : 0)
    )
  );
  
  const [prevIndex, setPrevIndex] = useState(-1);

  const transitionDuration = transitionSpeed || null;

  useEffect(() => {
    onPress(defaultActiveTabIndex, true);
  }, []);

  const range = (start: number, end: number) => {
    var len = end - start;
    var a = new Array(len);
    for (let i = 0; i < len; i++) a[i] = start + i;
    return a;
  };

  const onPress = (index: number, noAnimation: boolean = false) => {
    if (prevIndex !== index) {
      const customWidth = containerWidth || width;
      const tabWidth = customWidth / tabs.length;
      let rangeNumber = range(0, tabs.length).reverse();

      Animated.sequence([
        Animated.parallel(
          valuesRef.current.map((v) =>
            Animated.timing(v, {
              toValue: 0,
              useNativeDriver: true,
              duration: noAnimation ? 0 : 50,
            })
          )
        ),
        Animated.timing(value!, {
          toValue: I18nManager.isRTL
            ? customWidth + tabWidth * rangeNumber[index]
            : tabWidth * index,
          useNativeDriver: true,
          duration: noAnimation ? 0 : transitionDuration!,
        }),
        Animated.timing(valuesRef.current[index], {
          toValue: 1,
          useNativeDriver: true,
          duration: 750,
        }),
      ]).start();

      setPrevIndex(index);
    }
  };

  let mergeLabelStyle = { ...styles.labelStyle, ...labelStyle };
  let newActiveIcon = [
    styles.activeIcon,
    { backgroundColor: activeTabBackground || '#fff' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, key) => {
        const customWidth = containerWidth || width;
        const tabWidth = customWidth / tabs.length;
        let rangeNumber = range(0, tabs.length).reverse();
        const cursor = I18nManager.isRTL
          ? customWidth + tabWidth * rangeNumber[key]
          : tabWidth * key;

        const opacity = value!.interpolate({
          inputRange: [cursor - tabWidth, cursor, cursor + tabWidth],
          outputRange: [1, 0, 1],
          extrapolate: 'clamp',
        });

        const opacity1 = valuesRef.current[key].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        return (
          <React.Fragment key={key}>
            <TouchableWithoutFeedback
              onPress={() => {
                onPress(key);
                onTabChange && onTabChange(tab);
              }}
            >
              <Animated.View style={[styles.tab, { opacity, zIndex: 2 }]}>
                {tab.inactiveIcon}
                <Text style={mergeLabelStyle}>{tab.name} </Text>
              </Animated.View>
            </TouchableWithoutFeedback>
            <Animated.View
              style={{
                position: 'absolute',
                top: -8,
                left: tabWidth * key,
                width: tabWidth,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: opacity1,
                zIndex: 1,
              }}
            >
              <View style={newActiveIcon}>{tab.activeIcon}</View>
            </Animated.View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  activeIcon: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
});

export default StaticTabbar;
