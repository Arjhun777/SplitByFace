import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/appRouter";
import ErrorBoundary from "./resuableComponents/errorBoundary/ErrorBoundary";
import { loadModules } from "../loadModules";

const App = () => {
    const [moduleLoader, setModuleLoader] = useState(false);
    useEffect(() => {
        loadModules().then((result) => {
            setModuleLoader(true);
        });
    });

    return (
        <BrowserRouter>
            <ErrorBoundary history={history}>
                {!moduleLoader 
                    ?   <div>Loading</div>
                    :   <AppRouter />    
                }
            </ErrorBoundary>
        </BrowserRouter>
    )
}

export default App;