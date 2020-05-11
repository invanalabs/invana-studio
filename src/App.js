import React, {Suspense} from 'react';
import './App.css';
import GraphExplorerView from "./pages/explorer";
import NodesManagementView from "./pages/management/nodes";
import LinksManagementView from "./pages/management/links";
import AboutView from "./pages/about";
import Console from "./pages/console";
import LandingPageView from "./pages/index";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";

const Page404 = ({location}) => (
    <div  style={{marginTop: "48vh", "textAlign": "center"}}>
        <h2>
            No match found for <code>{location.pathname}</code>
        </h2>
        <p><a href={document.referrer} title={document.referrer}>&larr; go back </a> or <a href="/"> go home</a></p>
    </div>
);

export default class App extends React.Component {


    render() {
        return (
            <Router>
                <Suspense fallback={<div>Loading...</div>}>
                    <Switch>
                        <Route exact path="/" component={LandingPageView}/>
                        <Route exact path="/explorer" component={GraphExplorerView}/>
                        <Route exact path="/management" children={<Redirect to="/management/nodes" push={true}/>}/>

                        <Route exact path="/management/nodes" component={NodesManagementView}/>
                        <Route exact path="/management/links" component={LinksManagementView}/>
                        <Route exact path="/about" component={AboutView}/>
                        <Route exact path="/console" component={Console}/>
                        <Route component={Page404}/>

                    </Switch>
                </Suspense>
            </Router>
        )
    }
}


