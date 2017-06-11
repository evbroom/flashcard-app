import React from 'react';

export default function FlashCard(props) {
    return (
        <li>
            {props.data.question}: {props.data.answer}
            <button onClick={() => props.remove(props.data.key)}>❌</button>
        </li>
    )
}