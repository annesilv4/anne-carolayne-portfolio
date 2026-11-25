import { CONTACTS, PROFILE } from '@/data/content';

export default function Footer() {
    const gh = CONTACTS.find((c) => c.id === 'github');
    const li = CONTACTS.find((c) => c.id === 'linkedin');
    const social = [
        { label: 'GitHub', href: gh?.href ?? null },
        { label: 'LinkedIn', href: li?.href ?? null },
    ];
    return (
        <footer className="foot">
            <div className="wrap foot-in">
                <a className="foot-brand" href="#inicio" aria-label={`${PROFILE.name}, voltar ao início`}>
                    <span>
                        <b>{PROFILE.name}</b>
                        <small>{PROFILE.role}</small>
                    </span>
                </a>
                <nav className="foot-links" aria-label="Redes e contato">
                    {social.map((s) =>
                        s.href ? (
                            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                                {s.label}
                            </a>
                        ) : (
                            <a key={s.label} href="#" data-ph aria-disabled="true">
                                {s.label}
                            </a>
                        ),
                    )}
                    <a href="#contato">Contato</a>
                </nav>
                <p className="foot-copy">© {new Date().getFullYear()} {PROFILE.name}. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}