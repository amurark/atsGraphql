import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import EventsPage from './pages/Events';
import BookingsPage from './pages/Bookings';
import MainNavigation from './components/Navigation/MainNavigation'; 
import AuthContext from './context/auth-context';
import './App.css';

class App extends Component {
  state = {
    token: null,
    userId: null
  }

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId });
  }

  logout = () => {
    this.setState({token: null, userId: null});
  }

  render() {
    return (
      <BrowserRouter>
      <AuthContext.Provider value={{
          token: this.state.token, 
          userId: this.state.userId,
          login: this.login, 
          logout: this.logout
        }}>
        <MainNavigation />
        <main className="main-content">
          <Switch>
            {!this.state.token && (
              <Redirect path="/" to="/auth" exact />
            )}
            {this.state.token && (
              <Redirect path="/" to="/events" exact />
            )}
            {this.state.token && (
              <Redirect path="/auth" to="/events" exact />
            )}
            {!this.state.token && (
              <Route path="/auth" component={AuthPage} />
            )}
            <Route path="/events" component={EventsPage} />
            {this.state.token && (
              <Route path="/bookings" component={BookingsPage} />  
            )}
            
          </Switch>
        </main>
      </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
