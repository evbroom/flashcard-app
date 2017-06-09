import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    NavLink as Link,
    Route,
    Switch
} from 'react-router-dom';

class MakeCard extends React.Component {
    constructor() {
        super();
        this.state = {
            enterQuestion: '',
            enterAnswer: '',
            card: []
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log('hello')
        this.setState({
            enterQuestion: '',
            enterAnswer: ''
        });
    }

    handleChange(e) {
        console.log(e);
        
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    render() {
        return (
            <div>
                <h2>Card Creation Form</h2>
                <form onSubmit={this.handleSubmit}>
                    <input name="enterQuestion" value={this.state.enterQuestion} onChange={this.handleChange} type="text" />
                    <input name="enterAnswer" value={this.state.enterAnswer} onChange={this.handleChange} type="text" />
                    <input type="submit" value="Create Card" />
                </form>
            </div>
        )
    }
}

class App extends React.Component {
    constructor() {
        super();
    }
    render() {
        return (
            <Router>
                <div>
                    <header>
                        <h1>This is a flashcard app</h1>
                    </header>
                    <main>
                        <Link to="/createCard"><button>Build a Deck</button></Link>
                        <Route path="/createCard" component={MakeCard} />
                    </main>
                    <div>
                        <h2>Cards Will Be Displayed Here</h2>
                    </div>
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
