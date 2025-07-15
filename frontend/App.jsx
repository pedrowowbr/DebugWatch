import React, { useEffect, useState } from 'react';

export default function App() {
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:3000/status')
            .then(response => response.json())
            .then(data => setMensagem(data.message))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Debug Watch</h1>
            <p>{mensagem}</p>
        </div>
    );
}