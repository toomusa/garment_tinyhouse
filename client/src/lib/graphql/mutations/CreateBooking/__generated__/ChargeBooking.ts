/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChargeBookingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: ChargeBooking
// ====================================================

export interface ChargeBooking_clientSecret {
  __typename: "ChargeBooking";
  secret: string;
}

export interface ChargeBooking {
  clientSecret: ChargeBooking_clientSecret;
}

export interface ChargeBookingVariables {
  input: ChargeBookingInput;
}
