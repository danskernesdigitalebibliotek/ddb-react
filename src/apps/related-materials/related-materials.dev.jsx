import React from "react";
import RelatedMaterials from "./related-materials.entry";
import "./related-materials.scss";

export default {
  title: "Apps/Related materials",
  argTypes: {
    amount: {
      control: {
        type: "range",
        min: 0,
        max: 50
      }
    },
    maxTries: {
      control: {
        type: "range",
        min: 0,
        max: 10
      }
    }
  }
};

const Template = args => <RelatedMaterials {...args} />;

export const Entry = Template.bind({});
Entry.args = {
  pid: "870970-basis:54871910",
  clientId: "",
  materialUrl: "https://lollandbib.dk/ting/object/:pid",
  coverServiceUrl: "https://cover.dandigbib.org/api/v2",
  relatedMaterialsServiceUrl: "https://recommendation-staging.libry.dk/api/v1",
  titleText: "Forslag",
  amount: 10,
  maxTries: 5,
  agencyId: "736000"
};
