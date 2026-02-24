import Case1 from "./Case1";
import Case2 from "./Case2";
import {useEffect, useState} from "react";

const App = () => {
    const [show, setShow] = useState<"case1"|"case2">("case1")

    console.log("app");

    useEffect(() => {
        // @ts-ignore
        window.setShow = setShow

        return () => {
            // @ts-ignore
            window.setShow = undefined
        }
    }, [setShow]);

    return (
        <>
            {show === "case1" && <Case1/>}
            {show === "case2" && <Case2/>}
        </>

    );
};

App.whyDidYouRender = true

export default App;
