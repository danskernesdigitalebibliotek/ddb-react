import "./dev-fonts.scss";
import "../src/components/components.scss";
import { setToken } from "../src/core/token";
import "../src/core/mount";
import Store from "../src/components/store";
import { store } from "../src/core/store";
// Needed for the Store component.
import React from "react";
import { updateStatus } from "../src/core/user.slice";

// TODO: Using addon-redux would be much nicer, but it doesn't seem to
// be compatible with Storybook 6.
export const decorators = [
  Story => (
    <Store>
      <Story />
    </Store>
  )
];
