export const NAV = [
    { id: 'inicio', label: 'Início' },
    { id: 'about', label: 'Sobre mim' },
    { id: 'projects', label: 'Projetos' },
    { id: 'skills', label: 'Habilidades' },
] as const;

export const SECTION_IDS = NAV.map((n) => n.id);

export const PROFILE = {
    name: 'Anne Carolayne',
    role: 'Desenvolvedora Front-end',
    lead: 'Tenho experiência no desenvolvimento e manutenção de interfaces web, integração de APIs e construção de soluções utilizando React, Next.js e TypeScript. Gosto de transformar ideias em experiências digitais funcionais, intuitivas e bem estruturadas.',
    status: 'Aberta a oportunidades',
    stack: 'React · Next.js · TypeScript',
    marquee: ['React', 'Next.js', 'TypeScript', 'CSS Modules', 'JavaScript', 'APIs', 'Interfaces Responsivas'],
};

export const ABOUT = {
    big: 'Sou Anne, desenvolvedora Front-end Júnior, com experiência profissional na LXP EAD, atuando no desenvolvimento e na manutenção de interfaces web',
    text: 'Minha experiência envolve o desenvolvimento e a manutenção de interfaces web, utilizando principalmente Next.js e TypeScript. Também atuo na integração e no consumo de APIs, na implementação de melhorias e na correção de problemas em aplicações, participando de projetos e demandas desenvolvidos em equipe.',
    photoLabel: 'Anne Carolayne',
    photoSrc: '/foto-perfil.jpeg',
    trajectory: [
        {
            title: '2023 · Início da trajetória',
            detail: 'Iniciei meus estudos em desenvolvimento web por meio do curso Conectar, da Rocketseat. Em seguida, aprofundei meus conhecimentos com o Discover e estudei os fundamentos de Git e GitHub.'
        },
        {
            title: 'Formação · EBAC',
            detail: 'Ampliei meus conhecimentos em desenvolvimento Front-end e Back-end, aprofundando meus estudos em tecnologias e ferramentas utilizadas no desenvolvimento de aplicações web.'
        },
        {
            title: '2025–2026 · Experiência profissional na LXP EAD',
            items: [
                'Desenvolvimento e manutenção de interfaces web',
                'Integração e consumo de APIs',
                'Correção de bugs e implementação de melhorias',
                'Participação em projetos e demandas em equipe'
            ]
        },
        {
            title: 'Hoje · Novos desafios',
            detail: 'Busco novas oportunidades como Desenvolvedora Front-end Júnior, com o objetivo de aplicar meus conhecimentos, contribuir com projetos e continuar evoluindo profissionalmente.'
        }
    ],
    facts: [
        ['Localização', 'Jucás, CE, Brasil'],
        ['Atuação', 'Desenvolvimento front-end'],
        ['Formação', 'Rocketseat - EBAC'],
        ['Idiomas', 'Português, Inglês (Básico)'],
    ] as [string, string][],
};

export type MockKind = 'dashboard' | 'catalog' | 'board';


export interface Project {
    id: string;
    mock: MockKind;
    image: string | null;
    category: string;
    name: string;
    description: string;
    contribution: string;
    technologies: string[];
    demoUrl: string | null;
    repoUrl: string | null;
}

export const PROJECTS: Project[] = [
    {
        id: '01',
        mock: 'catalog',
        image: null,
        category: 'E-commerce',
        name: 'TechZone Shop',
        description: 'Loja virtual de produtos tecnológicos, desenvolvida como projeto da formação EBAC.',
        contribution: 'Desenvolvimento da interface da loja e implementação das funcionalidades do projeto.',
        technologies: ['React', 'Vite', 'JavaScript'],
        demoUrl: null,
        repoUrl: 'https://github.com/annesilv4/techzone-shop',
    },
    {
        id: '02',
        mock: 'board',
        image: null,
        category: 'Arquitetura de Software',
        name: 'Micro Frontends — Restaurante',
        description: 'Aplicação de restaurante desenvolvida utilizando a arquitetura de micro frontends.',
        contribution: 'Desenvolvimento e integração das aplicações que compõem o projeto.',
        technologies: ['Next.js', 'React', 'Module Federation'],
        demoUrl: null,
        repoUrl: 'https://github.com/annesilv4/micro-frontends-restaurante',
    },
    {
        id: '03',
        mock: 'dashboard',
        image: null,
        category: 'Desenvolvimento Web',
        name: 'Agência Criativa Web',
        description: 'Projeto de desenvolvimento de um site para uma agência criativa.',
        contribution: 'Desenvolvimento da interface e implementação dos elementos visuais do projeto.',
        technologies: ['HTML', 'CSS', 'SASS'],
        demoUrl: null,
        repoUrl: 'https://github.com/annesilv4/agencia-criativa-web',
    },
];

export interface SkillGroup {
    id: 'frontend' | 'frameworks' | 'ferramentas' | 'outros';
    title: string;
    description: string;
    tags: { label: string; abbr?: string }[];
}

export const SKILLS: SkillGroup[] = [
    {
        id: 'frontend',
        title: 'Front-end',
        description: 'A base de cada interface.',
        tags: [
            { label: 'HTML', abbr: 'H5' },
            { label: 'CSS', abbr: 'C3' },
            { label: 'JavaScript', abbr: 'JS' },
            { label: 'TypeScript', abbr: 'TS' },
        ],
    },
    {
        id: 'frameworks',
        title: 'Frameworks e bibliotecas',
        description: 'Construção e estilização de interfaces.',
        tags: [
            { label: 'React', abbr: 'Re' },
            { label: 'Next.js', abbr: 'Nx' },
            { label: 'Tailwind CSS', abbr: 'Tw' },
            { label: 'Bootstrap', abbr: 'Bs' },
            { label: 'CSS Modules', abbr: 'CM' },
        ],
    },
    {
        id: 'ferramentas',
        title: 'Ferramentas de desenvolvimento',
        description: 'Versionamento e rotina de desenvolvimento.',
        tags: [
            { label: 'Git', abbr: 'Gt' },
            { label: 'GitHub', abbr: 'Gh' },
            { label: 'VS Code', abbr: 'VS' },
        ],
    },
    {
        id: 'outros',
        title: 'Outros conhecimentos técnicos',
        description: 'O que conecta as telas ao produto.',
        tags: [
            { label: 'Integração e consumo de APIs' },
            { label: 'Componentização' },
            { label: 'Responsividade' },
            { label: 'Interfaces dinâmicas' },
            { label: 'Correção de bugs e melhorias' },
            { label: 'Trabalho em equipe' },
        ],
    },
];

export interface Contact {
    id: 'github' | 'linkedin' | 'email' | 'cv';
    label: string;
    value: string; // texto exibido
    href: string | null; // quando preenchido, vira link real
}

export const CONTACTS: Contact[] = [
    { id: 'github', label: 'GitHub', value: 'annesilv4', href: 'https://github.com/annesilv4' },
    { id: 'linkedin', label: 'LinkedIn', value: 'Anne Carolayne Barbosa da Silva', href: 'https://linkedin.com/in/anne-carolayne-barbosa-da-silva-468a8a396' },
    { id: 'email', label: 'E-mail profissional', value: 'annecarolayne.dev@gmail.com', href: 'mailto:annecarolayne.dev@gmail.com' },
    // { id: 'cv', label: 'Currículo (PDF)', value: '[Link do currículo em PDF]', href: null }, // ex.: '/curriculo-anne-carolayne.pdf' (arquivo em /public)
];