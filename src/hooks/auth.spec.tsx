import { renderHook } from "@testing-library/react-hooks";
import { act } from "@testing-library/react-native";
import fetchMock from "jest-fetch-mock";
import { mocked } from "ts-jest/utils";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthProvider, useAuth } from "./auth";
import { startAsync } from "expo-auth-session";

//Coloque no inicio do arquivo para habilitar o mock do fetch.
fetchMock.enableMocks();

const userInfo = {
  id: "1",
  email: "hariel@email.com",
  name: "Hariel",
  photo: "any_photo.png",
};

jest.mock("expo-auth-session");

describe("Auth Hook", () => {
  beforeEach(async () => {
    const userCollectionKey = "@gofinances:user";
    await AsyncStorage.removeItem(userCollectionKey);
  });

  it("should be able to sign in with an existing Google account", async () => {
    const googleMock = mocked(startAsync as any);

    //Primeiro, nós precisamos do Token. Então, vamos Mockar a função de startAsync.
    googleMock.mockReturnValueOnce({
      type: "success",
      params: {
        access_token: "any_token",
      },
    });

    //Agora que temos o Token, vamos mockar a requisição ttp dos dados de profile do usuário.
    fetchMock.mockResponseOnce(JSON.stringify(userInfo));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    //Chamando a função "signInWithGoogle" dentro do arquivo de auth.tsx
    await act(() => result.current.signInWithGoogle());

    expect(result.current.user.email).toBe(userInfo.email);
  });

  it("user should not connect if cancel authentication with google", async () => {
    const googleMock = mocked(startAsync as any);

    googleMock.mockReturnValueOnce({
      type: "cancel",
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).not.toHaveProperty("id");
  });
});
