import * as React from 'react';
import { Switch, Route } from "react-router-dom";
import { lazy } from "react";
// Dynamic Imports
const HomeComponent = lazy(() => import('../pageComponents/home/home'));

// App routing configuration
const AppRouter = () => {
    return (
        <React.Suspense fallback={<h1>loading...</h1>}>
            <Switch>
                <Route path="/home" component={HomeComponent} />
                <Route path="/" component={HomeComponent} />
            </Switch>
        </React.Suspense>
    )
}

export default AppRouter;