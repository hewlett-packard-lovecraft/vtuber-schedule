import { Stream } from '../../types/types'

import './CardContainer.css'

interface ICardContainerProps {
    stream: Stream;
}


function CardContainer(props: ICardContainerProps) {
    return (
        <>
            <div className='card'>
            </div>
        </>
    );
}

export default CardContainer;