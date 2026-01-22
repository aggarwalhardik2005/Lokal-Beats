// navigation/AppNavigator.tsx - Updated

import { FontAwesome, Fontisto, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import MiniPlayer from "../components/MiniPlayer";
import { colors, fontSize } from "../constants/tokens";
import HomeScreen from "../screens/HomeScreen";
import PlayerScreen from "../screens/PlayerScreen";
import QueueScreen from "../screens/QueueScreen";
import SearchScreen from "../screens/SearchScreen";
import audioService from "../services/audioService";
import { useMusicStore } from "../store/musicStore";
import { defaultStyles } from "../styles";

const Tab = createBottomTabNavigator();

// Animated Tab Bar Icon Component
const AnimatedTabBarIcon = ({ color, size, name, Icon }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIcon = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  useEffect(() => {
    animateIcon();
  }, [color, Icon, name, size]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Icon name={name} color={color} size={size} />
    </Animated.View>
  );
};

export default function AppNavigator() {
  const { initializeFromStorage } = useMusicStore();

  useEffect(() => {
    // Initialize audio service and load saved state on app start
    const initialize = async () => {
      try {
        await audioService.initialize();
        await initializeFromStorage();
        console.log("Audio service and storage initialized successfully");
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initialize();
  }, []);

  return (
    <NavigationContainer>
      <View style={defaultStyles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: ((route) => {
              const routeName =
                getFocusedRouteNameFromRoute(route) ?? route.name;
              // Hide tab bar on Player screen
              if (routeName === "Player") {
                return { display: "none" };
              }
              return {
                position: "absolute",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderTopWidth: 0,
                paddingWidth: 8,
              };
            })(route),
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: "#ffffffd8",
            tabBarLabelStyle: {
              fontSize: fontSize.xs,
              fontWeight: "500",
            },
            tabBarBackground: () => (
              <BlurView
                intensity={100}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  overflow: "hidden",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
            ),
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <AnimatedTabBarIcon
                  Icon={FontAwesome}
                  name="home"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <AnimatedTabBarIcon
                  Icon={Fontisto}
                  name="search"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Player"
            component={PlayerScreen}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <AnimatedTabBarIcon
                  Icon={FontAwesome}
                  name="play"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Queue"
            component={QueueScreen}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <AnimatedTabBarIcon
                  Icon={MaterialIcons}
                  name="queue-music"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
        </Tab.Navigator>

        {/* MiniPlayer floats above tab bar */}
        <MiniPlayer />
      </View>
    </NavigationContainer>
  );
}
