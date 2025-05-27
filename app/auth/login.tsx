import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useUserStore } from "../../store/useUserStore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { api } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const validateToken = useUserStore(state => state.validateToken);
  const setAuthToken = useUserStore(state => state.setAuthToken);
  const router = useRouter();
  const signIn = useUserStore(state => state.signIn);

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);
      const response = await api.post<{ accessToken: string }>("/auth/google", {
        token: userInfo.data?.idToken,
      });
      console.log(response, "response");
      const jwt = response.accessToken;
      await setAuthToken(jwt);
      const valid = await validateToken();
      if (valid) router.replace("/(tabs)");
      
      // Here you would typically send the userInfo to your backend
      // to authenticate the user and get your app's JWT token
      
      // For now, we'll just show the user info
      Alert.alert('Success', 'Google Sign-In successful!');
      
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        Alert.alert(
          'Configuration Error',
          'Vui lòng kiểm tra cấu hình Google Cloud Console và đảm bảo các Client ID đã được cấu hình đúng.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "473141251729-bnclhtpr2uhoqp5j53l1huugvrt47pqq.apps.googleusercontent.com",
    });
  }, []);

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

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isLoading}>
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
