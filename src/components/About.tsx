import { ABOUT } from '@/data/content';
import { ph } from '@/lib/ph';
import SectionHead from './SectionHead';
import Image from 'next/image';

export default function About() {
    return (
        <section id="about" className="sec">
            <div className="wrap">
                <SectionHead
                    num="01"
                    label="Sobre mim"
                    lines={['Experiência prática', <>em front-end<em>.</em></>]}
                />
                <div className="about">
                    <div className="frame rv">
                        <div className="photo" role="img" aria-label="Espaço reservado para a fotografia profissional da Anne">
                            {ABOUT?.photoSrc ? (
                                <Image
                                    src={ABOUT.photoSrc}
                                    alt={ABOUT.photoLabel}
                                    fill
                                    sizes="(max-width: 900px) 100vw, 40vw"
                                />
                            ) : (
                                <span>{ABOUT.photoLabel}</span>
                            )}
                        </div>
                    </div>
                    <div className="rv">
                        <p className="big">{ABOUT.big}</p>
                        <p>{ABOUT.text}</p>
                        <ul className="path" aria-label="Trajetória">
                            {ABOUT.trajectory.map((step) => (
                                <li key={step.title}>
                                    <strong>{ph(step.title)}</strong>
                                    {'detail' in step && step.detail ? ph(step.detail) : null}
                                    {'items' in step && step.items ? (
                                        <ul className="xp">
                                            {step.items.map((it) => (
                                                <li key={it}>{it}</li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                        <dl className="facts">
                            {ABOUT.facts.map(([k, v]) => (
                                <div key={k}>
                                    <dt>{k}</dt>
                                    <dd>{ph(v)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </section>
    );
}