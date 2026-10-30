
'use client';

import { useState } from 'react';

const chapters = [
    {
        id: 'origem',
        number: '01',
        title: 'Objetivos',
        eyebrow: 'Goals',
        heading: 'Tecnologia aplicada a problemas reais',
        description:
            'Busco desenvolver soluções que conectem tecnologia, dados e negócios. Tenho interesse especial em engenharia de dados, automação e inteligência artificial, explorando como transformar informações em decisões e processos mais eficientes.',
    },
    {
        id: 'visao',
        number: '02',
        title: 'Formação',
        eyebrow: 'Undergraduate',
        heading: 'Aprendizado Contínuo',
        description:
            'Graduando em Engenharia de Software pela FIAP (5º semestre), com bolsa integral pelo ProUni. Minha formação envolve desenvolvimento de software, algoritmos, estruturas de dados, bancos relacionais, estatística e arquitetura de soluções.',
    },
    {
        id: 'agora',
        number: '03',
        title: 'Experiência',
        eyebrow: 'Carrer',
        heading: 'Resultados Reais',
        description:
            'Minha trajetória profissional começou no Sport Club Corinthians Paulista como Jovem Aprendiz, onde pude evoluir até Analista de Transformação Digital, desenvolvendo soluções que reduziram em aproximadamente 80% o tempo de fechamento financeiro e 73% as despesas com cortesias de estacionamento por jogo. Atualmente estou em fase de transição atuando como estagiário em Dados e Automação, com análise, criação de indicadores e otimização de processos.',
    },
      {
        id: 'atuacao',
        number: '04',
        title: 'Competência',
        eyebrow: 'Hard Skills',
        heading: 'Análise, lógica e execução',
        description:
            'Possuo experiência com Python, SQL e ferramentas de análise de dados, aplicados ao tratamento de informações, automação de processos e construção de indicadores. Complemento minha base técnica com conhecimentos em estatística, visualização de dados e desenvolvimento backend.',
    },
];

export default function Presentation() {
    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <section className="relative flex h-full w-full items-center overflow-hidden px-6 md:px-12">

            {/* CONTEÚDO DINÂMICO — ESQUERDA */}
            <div className="relative z-[2] w-full md:w-[58%]">

                <div
                    key={active}
                    className="animate-presentation-in max-w-[860px]"
                >
                    <p className="mb-1 text-[10px] uppercase tracking-[.35em] text-warm">
                        {chapters[active].eyebrow}
                    </p>

                    <h2 className="mb-6 text-md font-light leading-tight tracking-[-.02em] md:text-2xl">
                        {chapters[active].heading}
                    </h2>

                    <p className="max-w-[600px] text-sm leading-[1.9] text-ink/90 md:text-lg">
                        {chapters[active].description}
                    </p>
                </div>

            </div>

            {/* TÍTULOS 3D — DIREITA */}
            <div className="absolute inset-y-0 right-0 flex w-full items-center justify-end md:w-[40%]">

                <div className="flex w-full flex-col items-end justify-center gap-0 pr-6 md:pr-12">

                    {chapters.map((chapter, index) => {
                        const selected = active === index;
                        const isHovered = hovered === index;

                        return (
                            <button
                                key={chapter.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setActive(index)}
                                onMouseEnter={() => setHovered(index)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                  group relative block w-full text-right
                  outline-none
                  transition-[opacity,filter] duration-500
                  ${selected || isHovered
                                        ? 'opacity-100'
                                        : 'opacity-45 hover:opacity-100'}
                `}
                            >
                                {/* Número editorial */}
                                <span className="absolute -right-5 top-[15%] hidden text-[9px] font-medium tracking-wider text-ink md:block">
                                    {chapter.number}
                                </span>

                                {/* Tipografia tridimensional */}
                                <span
                                    className="relative origin-right select-none whitespace-nowrap 
                                    hidden md:inline-block

                                    text-[clamp(3.5rem,3vw,6.5rem)] 
                                    
                                    font-light leading-[.9] tracking-[.08em] text-[#171510] transition-transform duration-500 ease-out"
                                    style={{
                                        transform: isHovered
                                            ? 'perspective(1000px) rotateY(-10deg) translateX(-8px)'
                                            : 'perspective(1000px) rotateY(-3deg)',

                                        textShadow: `
                                                    1px 1px 0 #9b9075,
                                                    2px 2px 0 #8b8068,
                                                    3px 3px 0 #7b705a,
                                                    4px 4px 0 rgba(23,21,16,.12)
                                                    `,
                                    }}
                                >
                                    {chapter.title}
                                </span>

                            </button>
                        );
                    })}

                </div>
            </div>

        </section>
    );
}
