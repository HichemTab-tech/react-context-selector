import * as React from 'react';
//import {GiveHichemTabTechCredit, MyComponent} from '../dist/main.js'; // Import your built library
import {GiveHichemTabTechCredit, MyComponent} from 'react-ctx-selector'; // Import your dev library

const App = () => {

    GiveHichemTabTechCredit();

    return (
        <div>
            <h1 className="text-red-600">React context selector Demo</h1>
            <MyComponent/>
        </div>
    );
};

export default App;