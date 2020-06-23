import React from "react";
import { Skeleton, Divider, Alert } from "antd";
import "./styles/ListingsSkeleton.css";

interface Props {
  title: string;
  error?: boolean;
}

export const ListingsSkeleton = ({title, error = false}: Props) => {
  const errorAlert = error 
    ? <Alert 
        type="error" 
        message="Something went wrong, please try again." 
        className="listings-skeleton_alert"
      /> 
    : null;

  return (
    <div className="listings-skeleton">
      {errorAlert}
      <h2>{title}</h2>
      <Skeleton active paragraph={{ rows: 1 }}/>
      <Divider />
      <Skeleton active paragraph={{ rows: 1 }}/>
      <Divider />
      <Skeleton active paragraph={{ rows: 1 }}/>
    </div>
  )
}