import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar'
import ContentContainer from './components/ContentContainer';

import './styles.css'


function App() {
  let [isSidebarActive, setSidebarActivity] = useState(false);

  return (
    <div id='layout' className={`App ${isSidebarActive ? 'active' : ''}`}>
      <Router>
        <main>
          <Sidebar isActive={isSidebarActive} setActive={setSidebarActivity} />
          <ContentContainer isSidebarActive={isSidebarActive} />
        </main>
      </Router>
    </div>
  );
}

export default App;
