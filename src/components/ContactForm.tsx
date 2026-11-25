'use client';

import { useRef, useState, type FormEvent } from 'react';

/**
 * Formulário de contato (por enquanto apenas valida e confirma na tela).
 * Para enviar de verdade, conecte `onSubmit` a uma rota de API, a um serviço de e-mail ou a um formulário externo.
 */
export default function ContactForm() {
    const [sent, setSent] = useState(false);
    const ref = useRef<HTMLFormElement>(null);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (ref.current && !ref.current.reportValidity()) return;
        setSent(true);
    };

    return (
        <form className="form rv" ref={ref} onSubmit={submit}>
            <div className="fld">
                <label htmlFor="f-nome">Nome</label>
                <input id="f-nome" name="nome" type="text" autoComplete="name" placeholder="Como posso te chamar?" required />
            </div>
            <div className="fld">
                <label htmlFor="f-email">E-mail</label>
                <input id="f-email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required />
            </div>
            <div className="fld">
                <label htmlFor="f-msg">Mensagem</label>
                <textarea id="f-msg" name="mensagem" placeholder="Conte um pouco sobre o que você precisa" required />
            </div>
            {sent ? (
                <p className="ok" role="status">
                    Mensagem enviada. Obrigada pelo contato!
                </p>
            ) : null}
            <button className="btn btn-p" type="submit">
                Enviar mensagem
            </button>
        </form>
    );
}