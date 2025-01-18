import { api } from "@/services/api";
import { ProfileResponse } from "@/services/userInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getTokenLocalStore = async () => {
  const localStore = await AsyncStorage.getItem("user-storage");
  console.log(localStore, "token");
  const parsedToken = localStore ? JSON.parse(localStore).state.token : null;
  return parsedToken;
};

export const getUserIdLocalStore = async () => {
  const localStore = await AsyncStorage.getItem("user-storage");
  let userId = localStore ? JSON.parse(localStore).state._id : null;
  if (!userId) {
    const token = localStore ? JSON.parse(localStore).state.token : null;
    if (token) {
      const res = await api.get<ProfileResponse>("/users/profile", { token });
      userId = res.data._id;
    }
  }
  console.log(userId, "123")
  return userId;
};
