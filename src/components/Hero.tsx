import { Fragment } from 'react';
import { PROFILE } from '@/data/content';
import HeroCanvas from './HeroCanvas';

export default function Hero() {
    return (
        <>
            <section id="inicio" className="hero">
                <div className="wrap hero-grid">
                    <p className="hero-tag m-in">
                        <span className="pulse" aria-hidden="true" />
                        <b>Front-end Developer</b>
                        <i aria-hidden="true" />
                        Brasil
                    </p>
                    <div id="heroText">
                        <h1>
                            <span className="ln"><span>Anne</span></span>
                            <span className="ln"><span>Carolayne<em>.</em></span></span>
                        </h1>
                        <p className="role m-in">{PROFILE.role}</p>
                        <p className="lead m-in">{PROFILE.lead}</p>
                        <div className="cta m-in">
                            <a className="btn btn-p" href="#projects">Conheça meus projetos</a>
                            <a className="btn btn-s" href="#contato">Entre em contato</a>
                        </div>
                    </div>
                    <div className="vis">
                        <i className="cm tl" aria-hidden="true" />
                        <i className="cm tr" aria-hidden="true" />
                        <i className="cm bl" aria-hidden="true" />
                        <i className="cm br" aria-hidden="true" />
                        <HeroCanvas />
                    </div>
                    <div className="hero-foot m-in">
                        <span><i className="pulse" aria-hidden="true" />{PROFILE.status}</span>
                        <span>{PROFILE.stack}</span>
                        <span>Role para explorar ↓</span>
                    </div>
                </div>
            </section>

            <div className="marq" aria-hidden="true">
                <div className="marq-track">
                    {[0, 1].map((k) => (
                        <Fragment key={k}>
                            {PROFILE.marquee.map((w) => (
                                <span key={`${k}-${w}`}>{w}</span>
                            ))}
                        </Fragment>
                    ))}
                </div>
            </div>
        </>
    );
}