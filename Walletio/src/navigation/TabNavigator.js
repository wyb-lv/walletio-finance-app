import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients, shadows } from "../theme/colors";
import { typography } from "../theme/typography";

// Screens
import BudgetPlanning from "../screens/BudgetPlanning";
import Analytic from "../screens/Analytic";
import AccountSettings from "../screens/AccountSettings";
import MyWallets from "../screens/MyWallets";

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: "BudgetPlanning", label: "Budget", emoji: "📊" },
  { name: "MyWallets", label: "Ví tiền", emoji: "👛" },
  { name: "CreateTransaction", label: "", emoji: "➕", isFAB: true },
  { name: "Analytic", label: "Analytic", emoji: "📈" },
  { name: "AccountSettings", label: "Cá nhân", emoji: "👤" },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG[index];

        const onPress = () => {
          if (cfg?.isFAB) {
            navigation.getParent()?.navigate("CreateTransaction");
            return;
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented)
            navigation.navigate(route.name);
        };

        if (cfg?.isFAB) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.fabWrap}
            >
              <LinearGradient colors={gradients.forest} style={styles.fab}>
                <Text style={styles.fabIcon}>＋</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabEmoji, isFocused && styles.tabEmojiActive]}>
              {cfg?.emoji}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {cfg?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="BudgetPlanning" component={BudgetPlanning} />
      <Tab.Screen name="MyWallets" component={MyWallets} />
      <Tab.Screen name="CreateTransaction" component={() => <View />} />
      <Tab.Screen name="Analytic" component={Analytic} />
      <Tab.Screen name="AccountSettings" component={AccountSettings} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    ...shadows.soft,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  tabEmoji: { fontSize: 20, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.family.medium,
  },
  tabLabelActive: { color: colors.primary },
  fabWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    ...shadows.lifted,
  },
  fabIcon: { fontSize: 26, color: "#FFFFFF", fontWeight: "300", marginTop: -2 },
});
