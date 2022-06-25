import React from "react";
import "./Navbar.css";

interface INavbarProps {
    last_updated: Date;
}


// display last updaded / what groups show up

function Navbar(props: INavbarProps) {
    const d = props.last_updated;

    return (
        <div className="navbar header">
            <h1>VTuber Schedule</h1>
            <div className="pure-g">
                <div className="pure-u-1-3"><p> {`Last updated: ${d.toLocaleString()}`}</p></div>
                <div className="pure-u-1-3"></div>
                <div className="pure-u-1-3"><p>{`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`}</p></div>
            </div>
        </div>
    );
}

export default Navbar;