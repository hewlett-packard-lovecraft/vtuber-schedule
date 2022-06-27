import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar'
import ContentContainer from './components/ContentContainer';

import './styles.css'
import refresh from './api/refresh';
import { Organization } from './types/types';

function App() {
  let [isSidebarActive, setSidebarActivity] = useState(false);
  let [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  let [streamData, setStreamData] = useState(new Array<Organization>());


  const updateStreamData = () => {
    const isPageActive = (document.visibilityState === 'visible');
    refresh(isPageActive, streamData, lastUpdatedAt)
      .then((output) => {
        const [latestStreamData, apiLastUpdateDate] = output;
        setStreamData(latestStreamData as Organization[])
        setLastUpdatedAt(new Date(apiLastUpdateDate as Date))
      })
  }

  useEffect(() => {
    updateStreamData()

    const interval =
      setInterval(
        () => updateStreamData()
        , 15 * 1000
      )
    // poll for new data immediately and then every 30 seconds

    return () => clearInterval(interval) // clear interval when the component unmounts

  }, [])

  return (
    <div id='layout' className={`App ${isSidebarActive ? 'active' : ''}`}>
      <Router>
        <main>
          <Sidebar isActive={isSidebarActive} setActive={setSidebarActivity} />
          <ContentContainer isSidebarActive={isSidebarActive} lastUpdatedAt={lastUpdatedAt} />
        </main>
      </Router>
    </div>
  );
}

export default App;
