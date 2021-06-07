import React, { Component } from 'react';
import { articleStore } from './redux/store.jsx';
import Routes from './Routes.jsx';
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/profile/Globalstyle";
import { lightTheme, darkTheme } from "./components/profile/UserThemes";
import { connect } from 'react-redux';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //theme : articleStore.getState().darkMode
            darkMode: false,            
        }
    }
    render() {
     //   console.log(sessionStorage.getItem("user"))
        let temp, mode;
        if (this.props.darkMode) {
            mode = this.props.darkMode
        }
        else if (sessionStorage.getItem("user")) {
            temp = JSON.parse(sessionStorage.getItem("user"))
            mode = temp.darkMode;
        }
       
        const theme = mode === '1' || mode === 1? darkTheme : lightTheme 
        return (
            <ThemeProvider theme= {theme}>
                <>
                    <GlobalStyles />
                    <div className="App">
                        <Routes/>
                     </div>
                 
                </>
            </ThemeProvider>
        )
    }
}


const mapStateToProps = (state) => {
    // alert("map")
    //console.log(state)
    return {
      darkMode: state.users.darkMode  
    }
  }
export default connect(mapStateToProps)(App);
  
