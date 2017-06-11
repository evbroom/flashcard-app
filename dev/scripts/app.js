import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    NavLink as Link,
    Route,
    Switch
} from 'react-router-dom';
import FlashCard from './components/FlashCard';

const config = {
    apiKey: "AIzaSyAT2FOHYxLaBE4ioV3zUgppcN2rWvzDMD8",
    authDomain: "flashcards-199bb.firebaseapp.com",
    databaseURL: "https://flashcards-199bb.firebaseio.com",
    projectId: "flashcards-199bb",
    storageBucket: "flashcards-199bb.appspot.com",
    messagingSenderId: "1089518784429"
};
firebase.initializeApp(config);

class BuildDeck extends React.Component {
    constructor() {
        super();
        this.state = {
            decks: [],
            name: ''
        }
        this.createDeck = this.createDeck.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    createDeck(e) {
        e.preventDefault();
        const deckInfo = {
            name: this.state.name
        }
        this.setState({
            name: ''
        });
        const dbRef = firebase.database().ref();
        dbRef.push(deckInfo);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    componentDidMount() {
        const dbRef = firebase.database().ref();

        dbRef.on("value", (firebaseData) => {
            const decksArray = [];
            const deckData = firebaseData.val();

            for (let deckKey in deckData) {
                deckData[deckKey].key = deckKey;
                decksArray.push(deckData[deckKey]);
            }
            this.setState({
                decks: decksArray
            })
        })
    }

    render() {
        return (
            <Router>
                <div>
                    <h1>Build a Deck</h1>
                    <form onSubmit={this.createDeck}>
                        <label htmlFor="deck">Deck Name </label>
                        <input name="name" value={this.state.name} onChange={this.handleChange} type="text" />
                        <input type="submit" value="Give deck a name" />
                    </form>
                    <MakeCard />
                </div>
            </Router>
        )
    }
}

class MakeCard extends React.Component {
    constructor() {
        super();
        this.state = {
            cards: [],
            question: '',
            answer: ''
        }
        this.addCard = this.addCard.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    addCard(e) {
        e.preventDefault();
        const cardInfo = {
            question: this.state.question,
            answer: this.state.answer
        }
        this.setState({
            question: '',
            answer: ''
        });
        const dbRef = firebase.database().ref();
        dbRef.push(cardInfo);
    }

    removeCard(cardToRemove) {
        console.log(cardToRemove);
        const dbRef = firebase.database().ref(cardToRemove);
        dbRef.remove();
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    componentDidMount() {
        const dbRef = firebase.database().ref();

        dbRef.on("value", (firebaseData) => {
            const cardsArray = [];
            const cardsData = firebaseData.val();

            for (let cardKey in cardsData) {
                /*
                {
                    question: "question 1",
                    answer: "answer 1"
                }
                */
                cardsData[cardKey].key = cardKey;
                /*
                {
                    question: "question 1",
                    answer: "answer 1",
                    key: "-KmMW_Gec0inC2E7nXxE"
                }
                */
                cardsArray.push(cardsData[cardKey]);
            }

            this.setState({
                cards: cardsArray
            })
        })
    }

    render() {
        return (
            <div>
                <h2>Card Creation Form</h2>
                <form onSubmit={this.addCard}>
                    <label htmlFor="question">Question: </label>
                    <input name="question" value={this.state.question} onChange={this.handleChange} type="text" />
                    <label htmlFor="answer">Answer: </label>
                    <input name="answer" value={this.state.answer} onChange={this.handleChange} type="text" />
                    <input type="submit" value="Create a card" />
                </form>
                <div>
                    <h2>Cards Will Be Displayed Below</h2>
                    <ul>
                        {this.state.cards.map((card, i) => {
                            return <FlashCard data={card} key={card.key} remove={this.removeCard} />
                        })}
                    </ul>
                </div>
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
                        <Link to="/buildDeck"><button>Build a Deck</button></Link>
                        <Route path="/buildDeck" component={BuildDeck} />
                    </main>
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
