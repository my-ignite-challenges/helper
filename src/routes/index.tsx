import { useEffect, useState } from "react";

import { NavigationContainer } from "@react-navigation/native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { AppRoutes } from "./app.routes";
import { Loading } from "../components/Loading";
import { SignIn } from "../screens/SignIn";

export function Routes() {
  const [ongoingAuthentication, setOngoingAuthentication] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User>(
    {} as FirebaseAuthTypes.User
  );

  useEffect(() => {
    const authenticationSubscriber = auth().onAuthStateChanged((response) => {
      setUser(response);
      console.log(response);
      setOngoingAuthentication(false);
    });

    return authenticationSubscriber;
  }, []);

  if (ongoingAuthentication) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {user ? <AppRoutes /> : <SignIn />}
    </NavigationContainer>
  );
}
