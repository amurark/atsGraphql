import React from 'react';
// This will catch clicks from anchor tags and prevents the default behaviour (browser reloading the page) and instead,
// 1. It will not reload the page and analyze the path you want to go
// 2. Manually alter the URL.
// 3. Manually render the page you are going to. 
import { NavLink } from 'react-router-dom';

// Gives capability of importing CSS into JS. 
import './MainNavigation.css';

// This is a functional component. 
// main-navigation__logo - BEM style
const mainNavigation = props => (
    <header className="main-navigation">
        <div className="main-navigation__logo">
            <h1>EasyEvent</h1>
        </div>
        <nav className="main-navigation__items">
            <ul>
                <li>
                    <NavLink to="/auth">Authenticate</NavLink>
                </li>
                <li>
                    <NavLink to="/events">Events</NavLink>
                </li>
                <li>
                    <NavLink to="/bookings">Bookings</NavLink>
                </li>
            </ul>
        </nav>
    </header>
    
);


export default mainNavigation;