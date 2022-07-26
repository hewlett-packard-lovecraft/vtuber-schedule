import React, { useState, useEffect, Suspense } from 'react';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { StreamCard } from '../../types/types';
import { filterScheduled, filterArchived, filterOrg, filterGroup } from './helper';
import { useParams } from 'react-router-dom';
import './ContentContainer.css';

// lazy load stream cards
const CardContainer = React.lazy(() => import('../CardContainer/'));


interface IContentContainerProps {
    lastUpdatedAt: Date;
    streamList: StreamCard[];
}


function ContentContainer(props: IContentContainerProps) {
    const [scheduledStreamList, setScheduledStreamList] = useState<StreamCard[]>([]);
    const [archivedStreamList, setArchivedStreamList] = useState<StreamCard[]>([]);

    let { groupId, orgId } = useParams();

    useEffect(() => {
        let streamList = props.streamList;
        console.log(groupId, orgId)

        if (orgId) {
            streamList = filterOrg(props.streamList, orgId)
        }

        if (groupId) {
            streamList = filterGroup(streamList, groupId)
        }

        setScheduledStreamList(filterScheduled(streamList))
        setArchivedStreamList(filterArchived(streamList))
    }, [props.streamList, orgId, groupId])

    return (
        <Col id='content-container' className="col-md-10 ms-sm-auto col-lg-11 px-md-4">
            <h2 className="h2 border-bottom">Live & Upcoming</h2>
            <Suspense fallback={
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            }>
                <CardContainer streams={scheduledStreamList} />
            </Suspense>

            <h2 className="h2 border-bottom">Past & Archived</h2>
            <Suspense fallback={
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            }>
                <CardContainer streams={archivedStreamList} />
            </Suspense>

        </Col>
    );
}

export default ContentContainer