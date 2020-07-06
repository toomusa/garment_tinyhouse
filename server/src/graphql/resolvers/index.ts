// import merge from "lodash.merge";
import { mergeResolvers } from "@graphql-tools/merge";
import { bookingResolvers } from "./Booking";
import { listingResolvers } from "./Listing";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";

export const resolvers = mergeResolvers([
  bookingResolvers,
  listingResolvers,
  userResolvers,
  viewerResolvers
]);
