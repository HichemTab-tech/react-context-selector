import * as React from 'react';
import {createContext, quickContextFactory, useContextSelector} from 'react-ctx-selector';
import {type Dispatch, type PropsWithChildren, type SetStateAction, useState} from "react";

const initialValue = {
    name: 'Hichem',
    age: 25,
    city: 'Alger'
};

const {QuickContextProvider, useQuickContext} = quickContextFactory().create({defaultValue: "" as unknown as [typeof initialValue, Dispatch<SetStateAction<typeof initialValue>>]});

const Component = () => {

    const age = useQuickContext((state) => state[0].age);

    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return (
        <>
            <div className={`${randomColor} p-3 my-2`}>
                If i change color, it means I just re-rendered
            </div>
            <div>
                Age is {age}
            </div>
        </>
    )
}

const Provider = ({children}: PropsWithChildren) => {

    const x = useState(initialValue);
    const [state, setState] = x;

    return (
        <QuickContextProvider>
            <div>
                <h1 className="text-red-600">React context selector Demo</h1>
                <div className="my-2">
                    <h3>Value: {JSON.stringify(state)}</h3>
                </div>
                <button onClick={() => setState({...state, age: state.age+1})}>Increase age</button>
                <br/>
                <button onClick={() => setState({...state, name: state.name+"-changed"})}>Change name</button>
                <br/>
                {children}
            </div>
        </QuickContextProvider>
    )
}


const Case2 = () => {


    console.log("one");

    return (
        <>
            <Provider>
                <Component/>
            </Provider>
        </>

    );
};

Case2.whyDidYouRender = true

export default Case2;
