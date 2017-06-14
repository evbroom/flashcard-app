import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    NavLink as Link,
    Route,
    // Switch
} from 'react-router-dom';
// import _ from 'underscore';

const config = {
    apiKey: 'AIzaSyAT2FOHYxLaBE4ioV3zUgppcN2rWvzDMD8',
    authDomain: 'flashcards-199bb.firebaseapp.com',
    databaseURL: 'https://flashcards-199bb.firebaseio.com',
    projectId: 'flashcards-199bb',
    storageBucket: 'flashcards-199bb.appspot.com',
    messagingSenderId: '1089518784429'
};
firebase.initializeApp(config);

class BuildDeck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            decks: [],
            name: ''
        }
        this.createDeck = this.createDeck.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.dbRef = firebase.database().ref()
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
    componentWillUnmount() {
        this.dbRef.off();
    }
    componentDidMount() {
        this.dbRef.on('value', (firebaseData) => {
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
            <div>
                <h1>Build a Deck</h1>
                <form onSubmit={this.createDeck}>
                    <label htmlFor='deck'>Deck Name </label>
                    <input name='name' value={this.state.name} onChange={this.handleChange} type='text' />
                    <input type='submit' value='Give the deck a name' />
                </form>
            </div>
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

        this.setState({
            question: '',
            answer: ''
        });
        const dbRef = firebase.database().ref('/' + this.props.match.params.deckId + '/cards');
        dbRef.push({ question: this.state.question, answer: this.state.answer });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    componentDidMount() {
        const dbRef = firebase.database().ref();

        dbRef.on('value', (firebaseData) => {
            const cardsArray = [];
            const cardsData = firebaseData.val();

            for (let cardKey in cardsData) {
                cardsData[cardKey].key = cardKey;
                cardsArray.push(cardsData[cardKey]);
            }

            this.setState({
                cards: cardsArray
            })
        })
    }

    render() {
        return (
            <Router>
                <div>
                    <h2>Create a Card</h2>

                    <form onSubmit={this.addCard}>
                        <label htmlFor='question'>Question: </label>
                        <input name='question' value={this.state.question} onChange={this.handleChange} type='text' />
                        <label htmlFor='answer'>Answer: </label>
                        <input name='answer' value={this.state.answer} onChange={this.handleChange} type='text' />
                        <input type='submit' value='Create a card' />
                    </form>
                    <div>
                        <DisplayCards deckKey={this.props.match.params.deckId} />
                    </div>
                </div>
            </Router>
        )
    }
}

class DisplayCards extends React.Component {
    constructor() {
        super();
        this.state = {
            cards: [],
        }
        this.removeCard = this.removeCard.bind(this)
    }
    removeCard(cardToRemove) {
        // console.log(cardToRemove);
        const dbRef = firebase.database().ref('/').child(this.props.deckKey).child('cards').child(cardToRemove)
        dbRef.remove();
    }
    render() {
        return (
            <div>
                <h2>Cards</h2>
                <ul>
                    {this.state.cards.map((card) => {
                        return (
                            <li key={card.key}>
                                {card.question}: {card.answer}
                                <button onClick={() => this.removeCard(card.key)}>❌</button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    componentDidMount() {
        const deckRef = firebase.database().ref(`/${this.props.deckKey}/cards`);

        deckRef.on('value', (firebaseData) => {
            // console.log(firebaseData.val());

            const cardsArray = [];
            const cardsData = firebaseData.val();
            console.log(cardsData);

            for (let cardKey in cardsData) {
                cardsArray.push({
                    question: cardsData[cardKey].question,
                    answer: cardsData[cardKey].answer,
                    key: cardKey
                });
            }

            this.setState({
                cards: cardsArray
            })
        })
    }
}

class DisplayDecks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            decks: []
        }
        this.dbRef = firebase.database().ref()
    }

    removeDeck(deckToRemove) {
        // console.log(deckToRemove);
        const dbRef = firebase.database().ref(deckToRemove);
        dbRef.remove();
    }
    render() {
        return (
            <div>
                <h1>Display Decks</h1>
                {this.state.decks.map((deck) => {
                    return (
                        <div>
                            {deck.name}
                            <Link to={`/playDeck/${deck.key}`}>
                                <button>Play</button>
                            </Link>
                            {/*<Link to={`/buildDeck/${deck.key}`}>
                                    <button>Edit</button>
                                </Link>*/}
                            <button onClick={() => this.removeDeck(deck.key)}>❌</button>
                            <Link to={`/makeCards/${deck.key}`}>Make cards for this deck</Link>
                        </div>
                    )
                })}
            </div>

        )
    }
    componentWillUnmount() {
        this.dbRef.off();
    }
    componentDidMount() {

        this.dbRef.on('value', (firebaseData) => {
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
}

class PlayDeck extends React.Component {
    constructor() {
        super()
        this.state = {
            decks: []
        }
        this.flipCard = this.flipCard.bind(this)
    }
    flipCard(e) {
        e.preventDefault();
        console.log('hi!')
        console.log(this)
    }

    render() {
        return (
            <div>
                <h1>Play Deck</h1>
                {this.state.decks.map((card) => {
                    return (
                        <div>
                            <div className='cardContainer'>
                                <div className='singleCard'>
                                    <div className='front'>
                                        {card.question}
                                        {/*<button></button>*/}
                                        {/*<button onClick={() => this.removeCard(card.key)}>❌</button>*/}
                                    </div>
                                    <div className='back'>
                                        {card.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    componentDidMount() {
        firebase.database().ref(`/${this.props.match.params.deckId}/cards`).on('value', (firebaseData) => {
            const decksArray = [];
            const deckData = firebaseData.val();

            for (let deckKey in deckData) {
                deckData[deckKey].key = deckKey;
                decksArray.push(deckData[deckKey]);
            }
            this.setState({
                decks: decksArray
            })
            console.log(decksArray)
        })
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
                    <header className='title'>
                        <a href="/"><h1>Flash-<span className='smallTitle'>lite</span></h1></a>
                    </header>
                    <main>
                        <nav className='buttonNav'>
                            <Link to='/displayDecks'><button className='button'>Display Decks</button></Link>
                            <Link to='/buildDeck'><button className='button'>Build A Deck</button></Link>
                        </nav>
                        <Route path='/displayDecks' component={DisplayDecks} />
                        <Route path='/buildDeck' component={BuildDeck} />
                        <Route path='/makeCards/:deckId' component={MakeCard} />
                        <Route path='/playDeck/:deckId' component={PlayDeck} />

                    </main>
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
