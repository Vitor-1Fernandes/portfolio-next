export type Project = {
  title: string;
  caption: string;
  /** Print real (em /public). Sem print, usa o mock desenhado em lib/screens.ts */
  image?: string;
  mock?: 'chart' | 'calendar' | 'list';
  video?: string;
  desc? : string,
  short? : string
};

export const projects: Project[] = [
  { title: 'SYND | Campeão NEXT 2026', caption: 'Modelo preditivo de público\nem jogos. Python.', video: '/video.mp4', desc:"Plataforma de inteligência conversacional desenvolvida com arquitetura multiagente utilizando Python, Google ADK e Gemini. Processa reuniões de vendas para identificar dores, objeções, riscos e oportunidades, vinculando cada insight a evidências da transcrição, com identificação do interlocutor e marcação temporal. Conta com avaliação de confiança, validação humana, análise histórica de clientes e estruturação de dados para CRM. Possui integração com Zoom, Google Meet e Microsoft Teams, backend em Java, dashboard gerencial e dispositivo IoT baseado em ESP32 para captura de áudio.", short:"Plataforma de inteligência conversacional desenvolvida para o challenge da FIAP em parceria com a TOTVS, arquitetura multiagente utilizando Python, Google ADK e backend em Java. Transforma reuniões de vendas em insights acionáveis" },
  { title: 'Calendário de Eventos', caption: 'Agendamentos, etapas e\nchecklists. Next.js.', mock: 'calendar' }
  // { title: 'Arena Perfil', caption: 'Gestão de ocorrências.\nSistema web.', mock: 'list' },
  // { title: 'Dashboard de Clientes', caption: 'Visão da carteira de\nclientes. React.', image: '/projects/dashboard-clientes.png' },
];

export type SceneDef = {
  kind: 'hero' | 'project' | 'about' | 'contact';
  /** lado do texto; o objeto 3D fica no lado oposto */
  side: 'left' | 'right';
  project?: number;
};

export const scenes: SceneDef[] = [
  { kind: 'hero', side: 'left' },
  { kind: 'about', side: 'left' },
  ...projects.map((_, i): SceneDef => ({
    kind: 'project',
    side: i % 2 === 0 ? 'left' : 'right',
    project: i,
  })),
  { kind: 'contact', side: 'left' },
];

export const nav = {
  home: 0,
  projects: 2,
  about: 1,
  contact: scenes.length - 1,
};

export const links = {
  github: 'https://github.com/vitor-1fernandes',
  linkedin: 'https://linkedin.com/in/vitor-fernandes-99625422b',
};
