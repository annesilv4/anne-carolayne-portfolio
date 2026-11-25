import type { ReactNode } from 'react';
import { SKILLS, type SkillGroup } from '@/data/content';
import SectionHead from './SectionHead';

const svg = (children: ReactNode) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);

const ICONS: Record<SkillGroup['id'], ReactNode> = {
    frontend: svg(<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />),
    frameworks: svg(
        <>
            <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.2-1.6-.3-.9.2-1.9 1.3-1.9H17a4 4 0 0 0 4-4c0-5-4-10.5-9-10.5Z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="10" cy="7" r="1" />
            <circle cx="15" cy="7.5" r="1" />
        </>,
    ),
    ferramentas: svg(
        <>
            <circle cx="6" cy="5.5" r="2.3" />
            <circle cx="6" cy="18.5" r="2.3" />
            <circle cx="18" cy="9" r="2.3" />
            <path d="M6 7.8v8.4M18 11.3c0 3.2-2.7 4.2-5.5 4.2H8.8" />
        </>,
    ),
    outros: svg(<path d="M12 3l9 5-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5" />),
};

export default function Skills() {
    return (
        <section id="skills" className="sec">
            <div className="wrap">
                <SectionHead
                    num="03"
                    label="Habilidades"
                    lines={[<>Habilidades<em>.</em></>]}
                    sub="Tecnologias e práticas do meu trabalho com interfaces, organizadas por área."
                />
                <div className="skills rv">
                    {SKILLS.map((g) => {
                        const plain = g.tags.every((t) => !t.abbr);
                        return (
                            <div className="sk" key={g.id}>
                                <div className="sk-h">
                                    <span className="sk-ic">{ICONS[g.id]}</span>
                                    <div>
                                        <h3>{g.title}</h3>
                                        <p>{g.description}</p>
                                    </div>
                                </div>
                                <ul className={plain ? 'tags plain' : 'tags'}>
                                    {g.tags.map((t) => (
                                        <li key={t.label}>
                                            {t.abbr ? <i>{t.abbr}</i> : null}
                                            {t.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}