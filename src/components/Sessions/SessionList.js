import React, { Component } from "react";
import "./sessions.css";
import PracticeCard from "../Cards/PracticeCard"
import Timer from "../Timer/Timer"
import APIManager from "../../module/APIManager"

export default class SessionList extends Component {

    state = {
        time: [],
        activeTimer: null,
        PracticeSessionCards: "",
        isRunning: false,
        elapsedTime: null
    };

    componentDidMount() {
        // console.log("session list mounted", this.props)

        const newState = {};

        APIManager.getAll("cards")
            .then(cards => (newState.PracticeCards = cards))
        .then(() => APIManager.getAll("sessions"))
            .then(sessions => (newState.Sessions = sessions))
      // Below gets data that contains the foreign keys of sessions and practice cards, not the literal cards
        .then(() =>APIManager.getAll("practiceSessionCards"))
            .then(practiceData => (newState.PracticeSessionCards = practiceData))


            .then(() => this.setState(newState))
            .then(() => this.getCardsInSession())
            .then(() => this.intervalID = setInterval(() => this.tick(), 1000))
            .then(() =>this.getTime())
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    getCardsInSession = () => {
            const allTime = this.state.PracticeSessionCards
                                    .filter(psc => psc.userId === parseInt(sessionStorage.getItem("userId")))
                                    .map(psc => (
                                        this.state.PracticeCards
                                            .filter(card => psc.cardId === card.id)
                                            .map(card => card.time)
                                            // .map(cardElapsedTime => {
                                            //     cardElapsedTime.elapsedTime = parseInt(cardElapsedTime.time)
                                            //     return cardElapsedTime})
                                    ))
            const newTimeArray = []
            // each time is its own array, so we use [0]
            allTime.forEach(time => newTimeArray.push({time: parseInt(time[0]), elapsedTime: parseInt(time[0])}))
            this.setState({ time: newTimeArray,
                            elapsedTime: newTimeArray})
            }


    getTime = () => {
        let timeOfEachSessionCard = 0
        this.state.time.forEach(cardTime =>{
          timeOfEachSessionCard += parseInt(cardTime.time)
          return timeOfEachSessionCard
      })
      let hrs = ~~(timeOfEachSessionCard / 3600);
      let mins = ~~((timeOfEachSessionCard % 3600) / 60);
      let secs = ~~timeOfEachSessionCard % 60;

      let ret = "";

      if (hrs > 0) {
          ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
      }

      ret += "" + mins + ":" + (secs < 10 ? "0" : "");
      ret += "" + secs;
      console.log("time that has been gotten in getTime", ret)
      return ret;
    }

    startTimer = async index => {
        await this.setState({ activeTimer: index });
      };

    startNextTimer = () => {
        this.setState({ activeTimer: this.state.activeTimer + 1 })
    }

    handleTimer = index => {
        this.setState(prevState => ({
          isRunning: !prevState.isRunning
        }));
        this.startTimer(index);
    };

    handleReset = () => {
        this.setState(prevState => {
          let resetCardTime = [...prevState.time];
          resetCardTime[prevState.activeTimer].elapsedTime =
            resetCardTime[prevState.activeTimer].time;

          return {
            time: resetCardTime
          };
        });
    };


    tick = () => {
        console.log("ticking in tick")
        // reduce time by 1 second by creating a copy of the exercise object in state and overwriting the elapsed time every second.
        if (this.state.isRunning) {
          this.setState(prevState => {
            //   console.log("tick seconds", prevState)
            const cardTime = [...prevState.time];
            console.log("card time before we subtract 1", cardTime)
            cardTime[prevState.activeTimer].elapsedTime -= .5;
                console.log("weird looking function", cardTime[prevState.activeTimer].elapsedTime -= .5)
                console.log("card time after we subtract 1", this.state.elapsedTime)
            return {
                time: cardTime
            };
        });
        //Timer stop functionality
        if (
            this.state.time.length === this.state.activeTimer + 1 &&
            this.state.time[this.state.activeTimer].elapsedTime === 0
            ) {
                this.setState({ isRunning: false });
                this.handleReset();
            }
            //   when countdown finishes
            //   reset isRunning bool
            //   reset clock
            else if (this.state.time[this.state.activeTimer].elapsedTime <= 0) {
                this.handleReset();
                this.startNextTimer();
            }
        }
        console.log("elapsed time", this.state.elapsedTime)
        console.log("time", this.state.time)
        console.log("activetimer", this.state.activeTimer)
      };



    render() {
    // console.log("session list rendering", this.props.PracticeSessionCards)
    return (

      <React.Fragment>
        <body className="musicBackground">
        <header className="text-center"><h1 className="sessionTitle">Practice Card {(this.state.activeTimer + 1)}'s Timer</h1></header>

        <div className="container rounded mt-3 list-group-item list-group-item-light text-dark">
            <div className="row flex d-flex justify-content-around mt-1">
            {
            this.state.time.map((time, index) => (
            <Timer
            key={index}
            time={time}
            index={index}
            getTime={this.getTime}
            startTimer={this.startTimer}
            startNextTimer={this.startNextTimer}
            handleTimer={this.handleTimer}
            handleReset={this.handleReset}
            activeTimer={this.state.activeTimer}
            isRunning={this.state.isRunning}
            />
            ))}
            </div>
        </div>

        <section>
            {/* going to filter over all PracticeSessionCards then map over Practice Cards */}
            {   this.props.Sessions.filter(session =>
                    session.userId === parseInt(sessionStorage.getItem("userId")))
                .map(session =>
                <div key={session.id} className="container mt-3 list-group-item list-group-item-light text-white">

                    <div className="row flex mt-1">
                    {
                        this.props.PracticeSessionCards
                            .filter( data =>
                                data.userId === parseInt(sessionStorage.getItem("userId")))
                            .map(data => {
                                return this.props.PracticeCards
                                .filter(card =>
                                (data.cardId === card.id))
                                .map(card => <PracticeCard key={card.id} session={session} data={data} card={card} getCardsInSession={this.getCardsInSession} {...this.props} />)
                                }
                            )
                    }
                    </div>
                </div>
                )
            }
            </section>
        </body>
      </React.Fragment>
    );
  }
}