import type { ReactNode } from 'react';
import { CONTACTS, type Contact as ContactItem } from '@/data/content';
import { isPh } from '@/lib/ph';
import SectionHead from './SectionHead';
import ContactForm from './ContactForm';

const outline = (children: ReactNode) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);

const ICONS: Record<ContactItem['id'], ReactNode> = {
    github: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
        </svg>
    ),
    linkedin: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.1V21h-4v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48V21h-4V9.75Z" />
        </svg>
    ),
    email: outline(
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </>,
    ),
    cv: outline(
        <>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </>,
    ),
};

function ContactLink({ c }: { c: ContactItem }) {
    const body = (
        <>
            {ICONS[c.id]}
            <div>
                <small>{c.label}</small>
                <span className={isPh(c.value) ? 'ph' : undefined}>{c.value}</span>
            </div>
            <b className="ar" aria-hidden="true">↗</b>
        </>
    );
    if (!c.href) {
        return (
            <a href="#" data-ph aria-disabled="true">
                {body}
            </a>
        );
    }
    const external = /^https?:/.test(c.href);
    return (
        <a href={c.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...(c.id === 'cv' ? { download: true } : {})}>
            {body}
        </a>
    );
}

export default function Contact() {
    return (
        <section id="contato" className="sec">
            <div className="wrap">
                <SectionHead num="04" label="Contato" lines={['Vamos construir', <>algo juntos<em>.</em></>]} />
                <div className="contact">
                    <div className="rv">
                        <p className="sub">
                            Está com uma vaga aberta ou quer conversar sobre front-end? Fale comigo por um destes canais ou pelo formulário.
                        </p>
                        <div className="links">
                            {CONTACTS.map((c) => (
                                <ContactLink key={c.id} c={c} />
                            ))}
                        </div>
                    </div>
                    <ContactForm />
                </div>
            </div>
        </section>
    );
}