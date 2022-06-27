import { Stream } from '../../types/types'

import './CardContainer.css'

interface ICardContainerProps {
    streams: Stream[];
}


function CardContainer(props: ICardContainerProps) {
    return (
        <>
            <div className='card-container'>
                
            </div>
        </>
    );
}

export default CardContainer;