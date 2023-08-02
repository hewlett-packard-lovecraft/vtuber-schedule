import { Card, Col, Row } from 'react-bootstrap'
import { StreamCard } from '../../types/types'
import './CardContainer.css'

interface ICardContainerProps {
    streams: StreamCard[];
}

function CardContainer(props: ICardContainerProps) {
    return (
        <>
            <div className='card-container'>
                <Row xs={2} md={6} className="g-6">
                    {props.streams.map((stream) => {
                        if (!stream.youtube_id || !stream.channel) {

                            console.log("Invalid stream card", stream)
                            return <></>
                        }

                        const timeDiff = stream.start_date.diffNow('hours')
                        const absTimeDiff = Math.abs(Math.floor(timeDiff.hours))


                        return (
                            <Col key={`col-${stream.youtube_id}`}>
                                <Card key={`card-${stream.youtube_id}`} border={stream.live ? 'danger' : ''}>
                                    <Card.Header>{`${timeDiff.hours >= 0 ? `In ${absTimeDiff} hours` : `${absTimeDiff} hour(s) ago`} (${stream.start_date.toFormat('HH:mm')})`}</Card.Header>
                                    <a href={stream.url}>
                                        <Card.Img loading="lazy" key={`card-img-${stream.youtube_id}`} variant="top" src={stream.thumbnail} />
                                    </a>
                                    <Card.Body key={`card-body-${stream.youtube_id}`}>
                                        <Card.Subtitle key={`card-title-${stream.youtube_id}`} >{stream.title}</Card.Subtitle>
                                        <Card.Link
                                            key={`card-link-${stream.youtube_id}`}
                                            className="mb-2 text-muted"
                                            href={stream.channel.youtube}
                                        >
                                            {stream.channel.channel_name}
                                        </Card.Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        </>
    );
}

export default CardContainer;