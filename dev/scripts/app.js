/*

TODOS:

- User authentication
- Form field validation
- Alert to confirm before a user deletes anything
- On top of my other list of nice-to-have's.. a "Night Mode" with a black background, light text.. I'll call it "Flash Nite" Mode
- Add a footer
- Make card input fields textarea's instead
- Ability to edit questions/answers already submitted


*/

import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    NavLink as Link,
    Route,
    Switch
} from 'react-router-dom';

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
            <div className='buildDeck'>
                <h2>Build A Deck</h2>
                <p className='buildDeckInstruct'>Give your deck a name, then click back on Display Decks to see your deck.</p>
                <form className="createDeck" onSubmit={this.createDeck}>
                    <label className="formLabel" htmlFor='deck'>Deck Name </label>
                    <input className="deckName" name='name' value={this.state.name} onChange={this.handleChange} type='text' />
                    <input className="button" type='submit' value='Give the deck a name' />
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
                    <div className='cardContainer'>
                        <h2>Create a Card</h2>
                        <form className='createCard' onSubmit={this.addCard}>
                            <div className='cardInput'>
                                <label htmlFor='question'>Question: </label>
                                <textarea rows='5' cols='30' className='createCardInput' name='question' value={this.state.question} onChange={this.handleChange}></textarea>
                            </div>
                            <div className='cardInput'>
                                <label htmlFor='answer'>Answer: </label>
                                <textarea rows='5' cols='30' className='createCardInput' name='answer' value={this.state.answer} onChange={this.handleChange}></textarea>
                            </div>
                            <input className='button' type='submit' value='Create a card' />
                        </form>
                        <div>
                            <DisplayCards deckKey={this.props.match.params.deckId} />
                        </div>
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
        const dbRef = firebase.database().ref('/').child(this.props.deckKey).child('cards').child(cardToRemove)
        dbRef.remove();
    }
    render() {
        return (
            <div>
                <h2>Cards</h2>
                <div className="cardWrap">
                    {this.state.cards.map((card) => {
                        return (
                            <div className='oneCard editCard' key={card.key}>
                                <div>
                                    <p className='cardTitle'>Question</p>
                                    <p>{card.question}</p>
                                </div>
                                <div>
                                    <p className='cardTitle'>Answer</p>
                                    <p>{card.answer}</p>
                                </div>
                                <i className='fa fa-times delCard' onClick={() => { if (confirm('Delete this card?')) { this.removeCard(card.key) } }}></i>
                            </div>
                        )
                    }).reverse()}
                </div>
            </div>
        )
    }

    componentDidMount() {
        const deckRef = firebase.database().ref(`/${this.props.deckKey}/cards`);

        deckRef.on('value', (firebaseData) => {
            const cardsArray = [];
            const cardsData = firebaseData.val();

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
        const dbRef = firebase.database().ref(deckToRemove);
        dbRef.remove();
    }
    render() {
        return (
            <div>
                <div className='wrapper'>
                    <h2>The Decks</h2>
                    <p></p>
                    <div className='deckContainer'>
                        {this.state.decks.map((deck) => {
                            return (
                                <div>
                                    <div className='oneCard' key={deck.key}>
                                        <div class='titleContainer'>
                                            <p className='deckTitle'>{deck.name}</p>
                                        </div>
                                        <div className='deckButtons'>
                                            <Link to={`/makeCards/${deck.key}`}><i className="fa fa-pencil-square-o"></i></Link>
                                            <Link to={`/playDeck/${deck.key}`}>
                                                <i className="fa fa-play-circle-o"></i>
                                            </Link>
                                            <i onClick={() => { if (confirm('Delete this deck?')) { this.removeDeck(deck.key) } }} className='fa fa-times'></i>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
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
            decks: [],
        }
    }
    render() {
        return (
            <div>
                <h2>Play Deck</h2>
                <p className='playDirections'>Tap on a card to flip it over and reveal the answer.</p>
                <div className='wrapper'>
                    <div className='deckContainer'>
                        {this.state.decks.map((card) => {
                            return (
                                <PlayCard card={card} key={card.key} />
                            )
                        })}
                    </div>
                </div>
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
        })
    }
}

class PlayCard extends React.Component {
    constructor() {
        super();
        this.state = {
            flipped: false
        };
        this.flipCard = this.flipCard.bind(this);
    }
    flipCard() {
        this.setState({
            flipped: this.state.flipped ? false : true
        });
    }
    render() {
        const className = this.state.flipped ? "flipped oneCard" : "oneCard";
        return (
            <div className={className} onClick={this.flipCard}>
                <div className='front'>
                    <p className>{this.props.card.question}</p>
                </div>
                <div className='back'>
                    <p>{this.props.card.answer}</p>
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
                    <header className='title'>
                        <a href="/"><h1>Flash-<span className='smallTitle'>lite</span></h1></a>
                        <p className="subheading">A flashcard app.</p>
                        <p className="instructions">Click below to build a new deck or display all of the existing decks.</p>
                    </header>
                    <main>
                        <nav className='buttonNav'>
                            <Link to='/displayDecks'><button className='button'>Display Decks</button></Link>
                            <Link to='/buildDeck'><button className='button'>Build A Deck</button></Link>
                        </nav>
                    </main>
                    <Route path='/displayDecks' component={DisplayDecks} />
                    <Route path='/buildDeck' component={BuildDeck} />
                    <Route path='/makeCards/:deckId' component={MakeCard} />
                    <Route path='/playDeck/:deckId' component={PlayDeck} />
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
