import React, { Dispatch, SetStateAction } from 'react';

import './Sidebar.css'

interface ISidebarProps {
  isActive: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
}


function Sidebar(props: ISidebarProps) {
  const handleClick = () => {
    props.setActive(!props.isActive)
  }

  return (
    <>
      <a href="#menu" id="menuLink" className={`menu-link ${props.isActive ? 'active' : ''}`} onClick={handleClick}>
        { /* Hamburger icon --> */}
        <span></span>
      </a>

      <div id="menu" className={`custom-restricted-width ${props.isActive ? 'active' : ''}`}>
        <div className="pure-menu">
          <a className="pure-menu-heading" href="/">
            VTuber Schedule
          </a>

          <ul className="pure-menu-list">
            <li className="pure-menu-item">
              <a href="/" className="pure-menu-link">
                All
              </a>
            </li>
            <li className="pure-menu-item">
              <a href="/hololive" className="pure-menu-link">
                Hololive
              </a>
            </li>
            <li className="pure-menu-item">
              <a href="/nijisanji" className="pure-menu-link">
                Nijisanji
              </a>
            </li>
            <li className="pure-menu-item">
              <a href="/etc" className="pure-menu-link">
                Etc
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Sidebar;