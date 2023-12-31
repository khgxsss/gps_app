import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  View,
  Animated,
  Text,
  TextStyle,
} from "react-native";
import * as shape from "d3-shape";
import Svg, { Path } from "react-native-svg";
import StaticTabbar from "./StaticTabbar";
import { useAuth } from "./AuthContext";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface Point {
  x: number;
  y: number;
}

const getPath = (tabWidth: number, width: number, totalTab: number, tabHeight: number): string => {
  const tab = shape
    .line<Point>()
    .x((d: Point) => d.x)
    .y((d: Point) => d.y)
    .curve(shape.curveBasis)([
    { x: width + tabWidth / 2 - 100, y: 0 },
    { x: width + tabWidth / 2 - 65 + -35, y: 0 },
    { x: width + tabWidth / 2 - 50 + 10, y: -6 },
    { x: width + tabWidth / 2 - 50 + 15, y: tabHeight - 14 },
    { x: width + tabWidth / 2 + 50 - 15, y: tabHeight - 14 },
    { x: width + tabWidth / 2 + 50 - 10, y: -6 },
    { x: width + tabWidth / 2 + 65 - -35, y: 0 },
    { x: width + tabWidth / 2 + 100, y: 0 },
  ]);
 
  return ` ${tab} `;
};

export interface TabsType {
  name: string;
  activeIcon: JSX.Element;
  inactiveIcon: JSX.Element;
}

interface Props {
  tabs: Array<TabsType>;
  containerTopRightRadius?: number;
  tabBarBackground: string;
  tabBarContainerBackground: string;
  containerBottomSpace?: number;
  containerWidth?: number;
  containerTopLeftRadius?: number;
  containerBottomLeftRadius?: number;
  containerBottomRightRadius?: number;
  activeTabBackground?: string;
  labelStyle?: TextStyle;
  onTabChange?: (tab: TabsType) => void;
  defaultActiveTabIndex?: number;
  transitionSpeed?: number;
}

const Tabbar: React.FC<Props> = (props) => {

  const { appDimension } = useAuth();
  const [value] = useState(new Animated.Value(0));

  const {
    tabs,
    containerTopRightRadius,
    tabBarBackground,
    tabBarContainerBackground,
    containerBottomSpace,
    containerWidth,
    containerTopLeftRadius,
    containerBottomLeftRadius,
    containerBottomRightRadius,
  } = props;

  let CustomWidth = containerWidth ? containerWidth : appDimension.appWidth;

  const translateX = value.interpolate({
    inputRange: [0, CustomWidth],
    outputRange: [-CustomWidth, 0],
  });

  let tabBarBackgroundColor = tabBarBackground
    ? tabBarBackground
    : "transparent";

  const tabWidth: number | void | string =
    tabs.length > 0
      ? CustomWidth / tabs.length
      : console.error("please add tab data");

  let d;
  if (typeof tabWidth == "number") {
    d = getPath(tabWidth, CustomWidth, tabs.length, appDimension.tabHeight);
  }

  let borderTopRightRadius = containerTopRightRadius
    ? containerTopRightRadius
    : 0;
  let borderTopLeftRadius = containerTopLeftRadius
    ? containerTopLeftRadius
    : 0;
  let borderBottomLeftRadius = containerBottomLeftRadius
    ? containerBottomLeftRadius
    : 0;
  let borderBottomRightRadius = containerBottomRightRadius
    ? containerBottomRightRadius
    : 0;

  if (tabs.length > 0) {
    return (
      <>
        <View
          style={{
            backgroundColor: tabBarContainerBackground
              ? tabBarContainerBackground
              : "#fff",
            position: "absolute",
            bottom: containerBottomSpace ? containerBottomSpace : 0,
            alignSelf: "center",
            borderTopRightRadius,
            borderTopLeftRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
          }}
        >
          <View
            {...{
              height:appDimension.tabHeight,
              width: CustomWidth,
              backgroundColor: tabBarContainerBackground
                ? tabBarContainerBackground
                : "#fff",
              alignSelf: "center",
              borderTopRightRadius,
              borderTopLeftRadius,
              borderBottomLeftRadius,
              borderBottomRightRadius,
            }}
          >
            <AnimatedSvg
              width={CustomWidth * 2}
              {...{ height:appDimension.tabHeight }}
              style={{
                transform: [{ translateX }],
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Path fill={tabBarBackgroundColor} {...{ d }} />
            </AnimatedSvg>
            <View style={StyleSheet.absoluteFill}>
              <StaticTabbar {...props} {...{ tabs, value }} />
            </View>
          </View>
        </View>
      </>
    );
  } else {
    return (
      <View style={styles.emptyContainer}>
        <Text>Please add tab data</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Tabbar;
