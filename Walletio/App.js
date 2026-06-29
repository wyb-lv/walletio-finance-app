import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { mystore } from "./src/store/index";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme/colors";
import { useFonts } from "expo-font";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("./src/assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("./src/assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("./src/assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("./src/assets/fonts/Inter-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <Provider store={mystore}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
