import React from "react"
import Navbar from "../Navbar";

import './ContentContainer.css'

interface IContentContainerProps {
    isSidebarActive: boolean;
    lastUpdatedAt: Date;
}


function ContentContainer(props: IContentContainerProps) {

    return (
        <>
            <div className={`content ${props.isSidebarActive ? 'active' : ''}`}>
                <Navbar last_updated={props.lastUpdatedAt} />
            </div>
        </>
    );
}

export default ContentContainer