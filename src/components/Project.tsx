import { PROJECTS, type Project } from '@/data/content';
import { isPh, ph } from '@/lib/ph';
import SectionHead from './SectionHead';
import ProjectMock from './ProjectMock';

function ActionLink({ href, label, placeholder, primary }: { href: string | null; label: string; placeholder: string; primary?: boolean }) {
    const cls = `btn ${primary ? 'btn-p' : 'btn-s'} btn-sm`;
    if (href) {
        return (
            <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
                {label}
            </a>
        );
    }
    return (
        <a className={`${cls} is-ph`} href="#" data-ph aria-disabled="true">
            {placeholder}
        </a>
    );
}

function ProjectCard({ p }: { p: Project }) {
    const incomplete = [p.category, p.name, p.description, p.contribution, ...p.technologies].some(isPh);
    return (
        <article className="pc rv">
            <div className="pc-media">
                {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="pc-img" src={p.image} alt={`Captura de tela do projeto ${p.name}`} />
                ) : (
                    <ProjectMock kind={p.mock} label="Espaço reservado para a captura de tela do projeto" />
                )}
            </div>
            <div className="pc-info">
                <div className="pc-top">
                    <span className="num">{p.id}</span>
                    {incomplete ? <span className="draft">Informações a preencher</span> : null}
                </div>
                <p className="cat">{ph(p.category)}</p>
                <h3>{ph(p.name)}</h3>
                <p>{ph(p.description)}</p>
                <p className="contrib">
                    <b>Minha contribuição</b>
                    <span>{ph(p.contribution)}</span>
                </p>
                <ul className="chips" aria-label="Tecnologias utilizadas">
                    {p.technologies.map((t, i) => (
                        <li key={`${t}-${i}`} className={isPh(t) ? 'ph' : undefined}>
                            {t}
                        </li>
                    ))}
                </ul>
                <div className="pc-act">
                    <ActionLink primary href={p.demoUrl} label="Ver demonstração online" placeholder="[Demonstração online]" />
                    <ActionLink href={p.repoUrl} label="Ver no GitHub" placeholder="[Repositório no GitHub]" />
                </div>
            </div>
        </article>
    );
}

export default function Projects() {
    return (
        <section id="projects" className="sec">
            <div className="wrap">
                <SectionHead
                    num="02"
                    label="Trabalhos selecionados"
                    lines={[<>Projetos<em>.</em></>]}
                    sub="Estrutura pronta para seus projetos reais. Os campos entre colchetes aguardam preenchimento."
                />
                <div className="grid-p">
                    {PROJECTS.map((p) => (
                        <ProjectCard key={p.id} p={p} />
                    ))}
                </div>
            </div>
        </section>
    );
}