/*THINGS THAT AREN'T WORKING:

1. Only the last card in a deck can flip over. I broke this functionality late last night, and I cant seem to fix it, so I haphazardly set it up as well as I could with the time that I had.

2. I can't seem to display the cards in a row, I believe it's a style issue.

3. The app is difficult to navigate at the moment (no breadcrumbs, awkward routing).

4. CSS is not very DRY

TODOS:

- Authentication (both user, and form fields)
- Alert to confirm before a user deletes anything
- Display cards in rows
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
                <p className='buildDeckInstruct'>Give your deck a name, then head back to Display Decks to see your deck.</p>
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
                    <h2>Create a Card</h2>
                    <form className='createCard' onSubmit={this.addCard}>
                        <label htmlFor='question'>Question: </label>
                        <input className='createCardInput' name='question' value={this.state.question} onChange={this.handleChange} type='text' />
                        <label htmlFor='answer'>Answer: </label>
                        <input className='createCardInput' name='answer' value={this.state.answer} onChange={this.handleChange} type='text' />
                        <input className='button' type='submit' value='Create a card' />
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
        const dbRef = firebase.database().ref('/').child(this.props.deckKey).child('cards').child(cardToRemove)
        dbRef.remove();
    }
    render() {
        return (
            <div>
                <h2>Cards</h2>
                {this.state.cards.map((card) => {
                    return (
                        <div className='singleCard editCard' key={card.key}>
                            <div>
                                <p className='cardTitle'>Question</p>
                                <p>{card.question}</p>
                            </div>
                            <div>
                                <p className='cardTitle'>Answer</p>
                                <p>{card.answer}</p>
                            </div>
                            <i className='fa fa-times delCard' onClick={() => this.removeCard(card.key)}></i>
                        </div>
                    )
                }).reverse()}
            </div>
        )
    }

    componentDidMount() {
        const deckRef = firebase.database().ref(`/${this.props.deckKey}/cards`);

        deckRef.on('value', (firebaseData) => {
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
                <h2>Display Decks</h2>
                {this.state.decks.map((deck) => {
                    return (
                        <div>
                            <div className='singleCard deckCard'>
                                <p className='deckTitle'>{deck.name}</p>
                                <div className='deckButtons'>
                                    <Link to={`/makeCards/${deck.key}`}><i className="fa fa-pencil-square-o"></i></Link>
                                    <Link to={`/playDeck/${deck.key}`}>
                                        <i className="fa fa-play-circle-o"></i>
                                    </Link>
                                    <i onClick={() => this.removeDeck(deck.key)} className='fa fa-times'></i>
                                </div>
                            </div>
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
            decks: [],
        }
        this.flipCard = this.flipCard.bind(this)
    }
    flipCard(cardId) {
        this.singleCard.classList.toggle('flipped')
    }

    render() {
        return (
            <div>
                <h2>Play Deck</h2>
                {this.state.decks.map((card) => {
                    return (
                        <div>
                            <div className='cardContainer'>
                                <div className='singleCard' ref={ref => this.singleCard = ref} onClick={() => this.flipCard(card.key)}>
                                    <div className='front'>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className='back'>
                                        <p>{card.answer}</p>
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
                        <p className="subheading">A flashcard app.</p>
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
