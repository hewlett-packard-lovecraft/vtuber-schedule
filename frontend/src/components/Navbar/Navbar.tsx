import { default as NavbarBootstrap } from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav"
import Col from "react-bootstrap/Col";

import "./Navbar.css";

interface INavbarProps {
    last_updated: Date;
    displaySidebar: boolean;
    setDisplaySidebar: React.Dispatch<React.SetStateAction<boolean>>;
}


function Navbar(props: INavbarProps) {
    return (
        <NavbarBootstrap className='flex-md-nowrap p-0 shadow' variant='dark' bg='dark' sticky='top'>
            <Col md={2} lg={1} me={0} px={1}>
                <NavbarBootstrap.Brand className="px-3">
                    VTSchedule
                </NavbarBootstrap.Brand>
            </Col>

            <NavbarBootstrap.Toggle
                className="navbar-toggler position-absolute d-md-none collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#sidebarMenu"
                aria-controls="sidebarMenu responsive-navbar-nav"
                aria-expanded="false"
                aria-label="Toggle navigation"
                label="Toggle navigation"
                type="button"
                onClick={() => props.setDisplaySidebar(!props.displaySidebar)}
            >
                <span className="navbar-toggler-icon"></span>
            </NavbarBootstrap.Toggle>

            <NavbarBootstrap.Collapse id="sidebarMenu responsive-navbar-nav">
                <div className="form-control form-control-dark w-100" >
                    <span>
                        {`${props.last_updated.toLocaleString()}`}
                    </span>
                </div>

                <Nav>
                    <Nav.Item className="text-nowrap">
                        <Nav.Link className="px-3" onClick={() => alert("Not implemented")}>Sign In</Nav.Link>
                    </Nav.Item>
                </Nav>
            </NavbarBootstrap.Collapse>
        </NavbarBootstrap>


    );
}

export default Navbar;