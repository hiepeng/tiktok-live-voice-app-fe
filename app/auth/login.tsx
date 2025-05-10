import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useUserStore } from "../../store/useUserStore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { api } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const validateToken = useUserStore(state => state.validateToken);
  const setAuthToken = useUserStore(state => state.setAuthToken);
  const router = useRouter();
  const signIn = useUserStore(state => state.signIn);

  let redirectUri = AuthSession.makeRedirectUri({ scheme: "t-live-voice" });
  // redirectUri = "https://auth.expo.io/@hiepnvna/t-live-voice"
  console.log(redirectUri, "redirectUri");
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "473141251729-bnclhtpr2uhoqp5j53l1huugvrt47pqq.apps.googleusercontent.com",
    // androidClientId: "473141251729-370efdpnpgupns51b0sg39lnifvpgb8r.apps.googleusercontent.com",
    androidClientId: "473141251729-bnclhtpr2uhoqp5j53l1huugvrt47pqq.apps.googleusercontent.com",
    // iosClientId: "473141251729-lnvtfq5gbopk80grvhonf8d14d790s2h.apps.googleusercontent.com",
    redirectUri,
  });

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const token = await signIn(email, password);
      console.log(token, "token");
      if (token) router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      const res: any = await promptAsync();
      const accessToken = res?.authentication?.accessToken;
      if (!accessToken) throw new Error("Không lấy được access token từ Google");

      const response = await api.post<{ accessToken: string }>("/auth/google", {
        token: accessToken,
      });
      const jwt = response.accessToken;
      await setAuthToken(jwt);
      const valid = await validateToken();
      if (valid) router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Login with Google failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle} disabled={isLoading}>
        <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF2D55",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  linkText: {
    color: "#FF2D55",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
});

export default Login;
