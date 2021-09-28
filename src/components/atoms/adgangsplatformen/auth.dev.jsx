import React from "react";
import { withQuery } from "@storybook/addon-queryparams";
import Auth from "./auth";

export default {
  title: "Adgangsplatformen",
  decorators: [withQuery]
};

const Template = args => <Auth {...args} />;

export const SignIn = Template.bind({});
