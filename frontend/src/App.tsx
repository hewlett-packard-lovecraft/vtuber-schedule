import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ContentContainer from './components/ContentContainer';
import refresh from './api/refresh';
import { Organization, Channel, StreamCard } from './types/types';
import { DateTime } from 'luxon';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import './styles.css'

function toStreamCard(streamData: Organization[]) {
  let streamList: StreamCard[] = [];

  streamList = streamData.flatMap(
    (org) => org.groups.flatMap(
      (group) => group.channels.flatMap(
        (channel) => channel.streams.flatMap(
          (stream) => ({
            org_name: org.name,
            group_name: group.groupName,
            channel: {
              channel_name: channel.channel_name,
              youtube_id: channel.youtube_id,
              youtube: channel.youtube,
              twitter: channel.twitter,
              avatar: channel.avatar,
              lastUpdated: channel.lastUpdated,
              groupName: channel.groupName,
            } as Channel,
            url: stream.url,
            youtube_id: stream.youtube_id,
            title: stream.title,
            thumbnail: stream.thumbnail,
            live: stream.live,
            lastUpdated: DateTime.fromISO(stream.lastUpdated),
            start_date: DateTime.fromISO(stream.start_date),
            end_date: DateTime.fromISO(stream.end_date),
          } as StreamCard)
        )
      )
    )
  )

  return streamList;
}

function App() {
  let [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  let [streamList, setStreamList] = useState(new Array<StreamCard>());
  let [displaySidebar, setDisplaySidebar] = useState(true);

  useEffect(() => {
    const updateStreamData = () => {
      const isPageActive = (document.visibilityState === 'visible');

      refresh(isPageActive, streamList, lastUpdatedAt)
        .then((output) => {
          if (!!output) {
            const [streamData, apiLastUpdateDate] = output;
            const streamCards = toStreamCard(streamData as Organization[]);
            setStreamList(streamCards)
            setLastUpdatedAt(new Date(apiLastUpdateDate as Date))
          }
        })
    }

    const interval =
      setInterval(
        () => updateStreamData()
        , 15 * 1000
      ) // poll for new data immediately and then every 15 seconds

    updateStreamData()

    return () => clearInterval(interval) // clear interval when the component unmounts

  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          last_updated={lastUpdatedAt}
          displaySidebar={displaySidebar}
          setDisplaySidebar={setDisplaySidebar}
        />

        <Container fluid>
          <Row>
            <Sidebar sidebarVisibility={displaySidebar} />
            <Routes>
              <Route path="/" element={<ContentContainer lastUpdatedAt={lastUpdatedAt} streamList={streamList} />} />
              <Route path="/hololive/en/" element={<ContentContainer lastUpdatedAt={lastUpdatedAt} streamList={streamList} />} />
              <Route path="/hololive/" element={<ContentContainer lastUpdatedAt={lastUpdatedAt} streamList={streamList} />} />
            </Routes>
          </Row>
        </Container>
      </div>
    </BrowserRouter>

  );
}

export default App;
