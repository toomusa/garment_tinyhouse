import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ApolloClient from 'apollo-boost';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ApolloProvider, useMutation } from "@apollo/react-hooks";
import { Home, Listing, Listings, NotFound, User, Login, AppHeader, Stripe, Host } from "./sections";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";
import { Viewer } from "./lib/types";
import { LOG_IN } from "./lib/graphql/mutations";
import { LogIn as LogInData, LogInVariables } from "./lib/graphql/mutations/LogIn/__generated__/LogIn";
import { Layout, Spin } from "antd";
import * as serviceWorker from './serviceWorker';
import "./styles/index.css";

const client = new ApolloClient({
  uri: "/api",
  request: async operation => {
    const token = sessionStorage.getItem("token");
    operation.setContext({
      headers: {
        "X-CSRF-TOKEN": token || ""
      }
    });
  },
});

const stripePromise = loadStripe(process.env.REACT_APP_S_PUBLISHABLE_KEY as string);

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) {
          sessionStorage.setItem("token", data.logIn.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    }
  });

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <Router>
      <Layout id="app">
        {logInErrorBannerElement}
        <div className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </div>
        <Switch>
          <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/host">
              <Host viewer={viewer} />
            </Route>
            <Route exact path="/listing/:id">
              <Elements stripe={stripePromise}>
                <Listing viewer={viewer} />
              </Elements>
            </Route>
            <Route exact path="/listings/:location?">
              <Listings />
            </Route>
            <Route exact path="/login">
              <Login setViewer={setViewer} />
            </Route>
            <Route exact path="/stripe">
              <Stripe viewer={viewer} setViewer={setViewer} />
            </Route>
            <Route exact path="/user/:id">
              <User viewer={viewer} setViewer={setViewer} />
            </Route>
            <Route>
              <NotFound />
            </Route>
        </Switch>
      </Layout>
    </Router>
  );
};

ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
