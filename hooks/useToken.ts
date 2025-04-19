import { api } from "@/services/api";
import { ProfileResponse } from "@/services/userInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserIdLocalStore = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;
  const res = await api.get<ProfileResponse>("/users/profile", { token });
  return res._id;
};
