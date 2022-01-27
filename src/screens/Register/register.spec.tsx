import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "styled-components/native";

import theme from "../../global/styles/theme";

import { Register } from ".";
import { NavigationContainer } from "@react-navigation/native";

const Providers: React.FC = ({ children }) => (
  <NavigationContainer>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </NavigationContainer>
);

describe("Screen: Register", () => {
  it("Should be open the category modal when user click on button", async () => {
    const { getByTestId } = render(<Register />, {
      wrapper: Providers,
    });

    const categoryModal = getByTestId("modal-category");
    const buttonCategory = getByTestId("button-category");
    fireEvent.press(buttonCategory);

    await waitFor(() => {
      expect(categoryModal.props.visible).toBeTruthy();
    });
  });
});
