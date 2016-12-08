import * as React from 'react';
import { IndexLink, Link } from 'react-router';

interface AppProps extends React.Props<App> { };

// This is the main application--it's a navbar at the top
// and a container for whatever page (component) is currently selected
export default class App extends React.Component<AppProps, {}> {
  public render() {
    return (
      <div>
        <div>
          <ul className="nav navbar-nav">
            <li><IndexLink to="/">Home</IndexLink></li>
          </ul>
        </div>
        <br />
        <br />
        <div className="container">
          {this.props.children}
        </div>
      </div>
    );
  }
}