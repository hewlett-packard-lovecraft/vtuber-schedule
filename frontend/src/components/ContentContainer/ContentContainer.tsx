import { useState, useEffect } from 'react'
import './ContentContainer.css'
import CardContainer from '../CardContainer/'
import Col from 'react-bootstrap/Col'
import { StreamCard } from '../../types/types'
import { filterScheduled, filterArchived } from './helper'

interface IContentContainerProps {
    lastUpdatedAt: Date;
    streamList: StreamCard[]
}


function ContentContainer(props: IContentContainerProps) {
    const [streamList, setStreamList] = useState<StreamCard[]>([]);
    const [scheduledStreamList, setScheduledStreamList] = useState<StreamCard[]>([]);
    const [archivedStreamList, setArchivedStreamList] = useState<StreamCard[]>([]);

    useEffect(
        () => {
            setStreamList(props.streamList)
            setScheduledStreamList(filterScheduled(streamList))
            setArchivedStreamList(filterArchived(streamList))
        }, [props.streamList]
    )

    return (
        <Col id='content-container' className="col-md-10 ms-sm-auto col-lg-11 px-md-4">
            <h2 className="h2 border-bottom">Live & Upcoming</h2>
            <CardContainer streams={scheduledStreamList} />

            <h2 className="h2 border-bottom">Past & Archived</h2>
            <CardContainer streams={archivedStreamList} />
        </Col>
    );
}

export default ContentContainer