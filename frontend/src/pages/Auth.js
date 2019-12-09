import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {

    // State is an object which is privately maintained inside a compoenent.
    // It can influence what is rendered on the browser.
    // It can be changed within the compoenent using the setState method. 
    state = {
        isLogin: true
    }

    // Because of this, react will give us access to AuthContext in `this.context` property.
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }

    switchModeHandler = () => {
        this.setState(prevState => {
            return {isLogin: !prevState.isLogin};
        });
    }

    submitHandler = (event) => {
        // To prevent the form from submitting a request to the current URl --> localhost:3000/auth.
        event.preventDefault();
        // The 'current' prop is given to us by React, it refers to the actual DOM element
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if (email.trim().length === 0 || password.trim().length === 0) {
            return;
        }

        let requestBody = {
            query: `
                query {
                    login(email: "${email}", password: "${password}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        };

        if(!this.state.isLogin) {
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${email}", password:"${password}"}) {
                            _id
                            email
                        }
                    }
                `
            };
        }

        

        // Fetch API is a browser method used to send/fetch data to a server. 
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            //Content-Type ensures that the backend tries to parse JSON from the body. 
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed');
            }
            return res.json();
        })
        .then(resData => {
            if(resData.data.login.token) {
                this.context.login(
                    resData.data.login.token, 
                    resData.data.login.userId, 
                    resData.data.login.expirationField
                );
            }
            console.log(resData);
        })
        .catch(err => {
            console.log(err);
        });
    };

    render() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <label htmlFor="email">E-Mail</label>
                    <input type="email" id="email" ref={this.emailEl} />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} />
                </div>
                <div className="form-actions">
                    {/* Here the button "submit" is specifically used to submit the form. (unlike the button type above)  */}
                    <button type="submit">Submit</button>
        <button type="button"onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'SignUp' : 'Login'}</button>
                </div>
            </form>
        )
    }
}

export default AuthPage;