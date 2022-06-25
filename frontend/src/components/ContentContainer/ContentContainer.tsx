import React from "react"
import Navbar from "../Navbar";

import './ContentContainer.css'

interface IContentContainerProps {
    isSidebarActive: boolean;
}

const d = new Date();

function ContentContainer(props: IContentContainerProps) {

    return (
        <>
            <div className={`content ${props.isSidebarActive ? 'active' : ''}`}>
                <Navbar last_updated={d} />
            </div>
        </>
    );
}

export default ContentContainer