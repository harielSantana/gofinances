import React from "react";
import { render } from "@testing-library/react-native";

import { Profile } from "../../screens/Profile";

describe("Screen: Profile", () => {
  it("should have an input with placeholder value as name", () => {
    const { getByPlaceholderText } = render(<Profile />);

    const inputName = getByPlaceholderText("Nome");

    expect(inputName).toBeTruthy();
  });

  it("should checks if user data has been loaded", () => {
    const { getByTestId } = render(<Profile />);

    const inputName = getByTestId("input-name");
    const inputSurname = getByTestId("input-surname");

    expect(inputName.props.value).toEqual("InputName");
    expect(inputSurname.props.value).toEqual("InputSurname");
  });

  it("should checks if title render correctly", () => {
    const { getByTestId } = render(<Profile />);

    const testTitle = getByTestId("text-title");

    expect(testTitle.props.children).toContain("Perfil");
  });
});
