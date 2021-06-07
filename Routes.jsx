import React, { Component } from 'react';
import { BrowserRouter as Router, HashRouter, Switch, Route, Link, withRouter } from 'react-router-dom';

import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';
import NotFound from './components/common/NotFound';

import Home from './components/pages/Home';
import About from './components/pages/About';
//import NavCourses from './components/pages/NavCourses';
import NavCourses from './components/formats/NavCourses';
import Courses from './components/pages/Courses';

import SideBar from './components/common/SideBar';
import Login from './components/profile/Login';
import Register from './components/profile/Register';
import ResetPassword from './components/profile/ResetPassword';
import ViewArticle from './components/profile/ViewArticle';

import ListCourses from './components/courses/ListCourses';
import ListBreakdowns from './components/courses/ListBreakdowns';

import WriteArticle from './components/article-gen/WriteArticle';
import Theme from './components/formats/Theme';

class Routes extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const path = this.props.location.pathname;
        const loc = path.split('/');
        const location = loc[1];
        const navbar = ['articlegen', 'profile', 'login', 'register', 'reset-password', 'theme','sidebar'];
        const navcourse = ['', 'home', 'articlegen', 'profile', 'login', 'register', 'reset-password', 'theme','sidebar'];
        const footer = ['articlegen', 'theme'];

        return (
            <>
                {navbar.includes(location) ? '' : <NavBar />}
                {navcourse.includes(location) ? '' : <NavCourses />}

                <div className="page-content">
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="/home" component={Home} />
                        <Route path="/about" component={About} />
                        <Route exact path="/courses/all" component={Courses} />
                        <Route path="/profile" component={SideBar} />
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route path="/reset-password" component={ResetPassword} />
                        <Route path="/articlegen/:breakdownid/:articleuuid" component={WriteArticle} />
                        <Route path="/view-article/:breakdownid/:articleuuid" component={ViewArticle} />
                        <Route path="/breakdown/:id" component={ListBreakdowns} />
                        <Route path="/write-articles" component={ListCourses} />
                        <Route path="/theme/:type" render={(props) => {
                            return (
                                <Theme type={props.match.params.type} />)
                        }} />
                        {/*  <Route component={NotFound} />*/}
                    </Switch>
                </div>
                {footer.includes(location) ? '' : <Footer />}
            </>
        )
    }
}
export default withRouter(Routes);