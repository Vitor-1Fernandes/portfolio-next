
'use client';

import { useState, type ReactNode } from 'react';
import { usePager } from '@/hooks/usePager';
import { links, nav, projects, scenes, type SceneDef } from '@/lib/content';
import Scene3D from './Scene3D';
import CustomCursor from './CustomCursor';
import Presentation from './Presentation';
import { Copy } from 'lucide-react';

const pad = (n: number) => String(n).padStart(2, '0');

const reveal =
  'opacity-0 translate-x-6 transition-[opacity,transform] duration-[1200ms] ease-out group-data-[on=true]:translate-x-0 group-data-[on=true]:opacity-100';

function Scene({
  active,
  side,
  caption,
  children,
  alignCenter = false,
}: {
  active: boolean;
  side: SceneDef['side'];
  caption?: string;
  children: ReactNode;
  alignCenter?: boolean;
}) {
  return (
    <section
      data-on={active}
      className={`group relative flex h-full w-screen shrink-0 px-6 pb-28 md:px-12 md:pb-0 ${alignCenter ? 'items-center' : 'items-end md:items-center'
        } ${side === 'right' ? 'md:justify-end' : ''}`}
    >
      {children}

      {caption && (
        <p className={`absolute bottom-6 left-6 whitespace-pre-line text-[11px] leading-snug md:left-12 ${reveal}`}>
          {caption}
        </p>
      )}
    </section>
  );
}

export default function Portfolio() {
  const { state, track, bar, go, target, near } = usePager(scenes.length);

  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  return (
    <>
      <div className="grain" />
      <CustomCursor />

      <div className="pointer-events-none fixed inset-0 z-[4] bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,0,0,0)_35%,rgba(40,28,10,.38)_100%)]" />

      {/* NAVEGAÇÃO */}
      <header className="fixed inset-x-0 top-0 z-10 bg-ink pt-[env(safe-area-inset-top,0px)] text-cream">
        <div className="flex h-14 items-center justify-between px-6 text-[11px] uppercase tracking-[.2em] md:px-12">
          <button onClick={() => go(nav.home)}>
            Ínicio
          </button>

          <nav className="flex gap-6 md:gap-10">
            <button className="transition hover:opacity-60" onClick={() => go(nav.about)}>
              Sobre
            </button>
            <button className="transition hover:opacity-60" onClick={() => go(nav.projects)}>
              Projetos
            </button>
            <button className="transition hover:opacity-60" onClick={() => go(nav.contact)}>
              Contato
            </button>
          </nav>
        </div>
      </header>

      {/* RODAPÉ */}
      <footer className="fixed inset-x-0 bottom-0 z-10 bg-ink pb-[env(safe-area-inset-bottom,0px)] text-cream">
        <div className="flex h-12 items-center gap-6 px-6 text-[10px] uppercase tracking-[.2em] md:px-12">
          <span className="hidden text-cream/60 sm:inline">
            São Paulo, SP
          </span>

          <div className="relative h-px flex-1 bg-cream/20">
            <div ref={bar} className="absolute left-0 top-0 h-px w-0 bg-cream" />
          </div>

          <span className="tabular-nums text-cream/80">
            {pad(target + 1)} / {pad(scenes.length)}
          </span>

          <span className="text-cream/60">Scroll →</span>
        </div>
      </footer>

      {/* CENAS */}
      <main className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] bottom-[calc(3rem+env(safe-area-inset-bottom,0px))] z-0 overflow-hidden">
        <Scene3D pager={state} />

        <div
          ref={track}
          className="absolute inset-y-0 left-0 flex w-max will-change-transform"
        >
          {scenes.map((s, i) => {
            const active = near === i;

            {/* PRIMEIRA TELA */ }
            if (s.kind === 'hero') {
              return (
                <Scene
                  key={i}
                  active={active}
                  side={s.side}
                  alignCenter
                >
                  <div
                    className={`flex w-full flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10 md:gap-12 ${reveal}`}
                  >
                    {/* RETRATO */}
                    <div className="relative w-[145px] shrink-0 sm:w-[190px] md:w-[228px]">
                      <div className="relative aspect-[.768] border border-black/35 p-[5px] shadow-[12px_12px_0_rgba(0,0,0,.04)]">
                        <div className="absolute inset-[5px] overflow-hidden bg-[#c9bea0]">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,.7),transparent_70%)]" />

                          <div className="absolute inset-0 bg-gradient-to-b from-[#e2d8bd]/30 to-[#756d57]/30" />

                          <img
                            src="/vitor.png"
                            alt="Vitor Fernandes"
                            className="absolute inset-0 h-full w-full object-contain object-bottom grayscale-[5%] sepia-[5%] contrast-[.95]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* NOME */}
                    <div className="min-w-0">
                      <p className="mb-6 text-[10px] uppercase tracking-[.35em] text-warm md:text-[11px]">
                        Portfólio
                      </p>

                      <h1 className="text-4xl font-light uppercase leading-[1.04] tracking-[.09em] sm:text-5xl md:text-7xl">
                        Vitor
                        <br />
                        Fernandes
                      </h1>

                      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[.15em] text-warm md:text-[13px]">
                        Engenharia de Software | Dados e Automação
                      </p>
                    </div>
                  </div>
                </Scene>
              );
            }

            {/* SOBRE */ }
            if (s.kind === 'about') {
              return (
                <Scene key={i} active={active} side={s.side} alignCenter>
                  <Presentation />
                </Scene>
              );
            }

            {/* PROJETOS */ }
            if (s.kind === 'project' && s.project !== undefined) {
              const pr = projects[s.project];
              const isExpanded = expandedProject === s.project;

              return (
                <Scene key={i} active={active} side={s.side}>
                  <div
                    className={`max-w-[80%] md:max-w-[46%] ${s.side === 'right' ? 'md:text-right' : ''
                      } ${reveal}`}
                  >
                    <p className="text-[11px] uppercase tracking-[.3em] text-warm">
                      Projetos
                    </p>

                    <h2 className="text-xl font-light uppercase tracking-[.08em] md:text-xl">
                      {pr.title}
                    </h2>

                    {/* DESCRIÇÃO */}
                    <div className="mt-4">
                      <div
                        className={`grid transition-[grid-template-rows] duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                          }`}
                      >
                        <div className="overflow-hidden">
                          <p
                            className={`leading-[1.9] text-ink/90 transition-opacity duration-500 md:text-base ${isExpanded ? 'opacity-100' : 'opacity-0'
                              }`}
                          >
                            {pr.desc}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`grid transition-[grid-template-rows] duration-700 ease-in-out ${isExpanded ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                          }`}
                      >
                        <div className="overflow-hidden">
                          <p
                            className={`hidden md:block leading-[1.9] text-ink/90 transition-opacity duration-500 md:text-base ${isExpanded ? 'opacity-0' : 'opacity-100'
                              }`}
                          >
                            {pr.short}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedProject(
                            isExpanded ? null : s.project!
                          )
                        }
                        className="mt-4 text-[10px] uppercase tracking-[.2em] text-warm transition-opacity hover:opacity-50"
                      >
                        {isExpanded ? 'Ler menos −' : 'Ler mais +'}
                      </button>
                    </div>
                  </div>
                </Scene>
              );
            }

            {/* CONTATO */ }
            return (
              <Scene key={i} active={active} side={s.side}>
                <div className={reveal}>
                  <p className="mb-6 text-[11px] uppercase tracking-[.3em] text-warm">
                    Contato
                  </p>

                  <div className="flex flex-col gap-3 text-sm uppercase tracking-[.15em]">

                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-3 transition hover:opacity-50">
                        E-mail
                        <span className="text-[16px] text-warm transition-transform duration-300 group-open:rotate-45">
                          +
                        </span>
                      </summary>

                      <div className="mt-2 flex items-center gap-3 text-[14px] text-warm tracking-normal">
                        <span>vitorfernandes11122006@gmail.com</span>

                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText("vitorfernandes11122006@gmail.com")
                          }
                          className="transition hover:opacity-50 text-black"
                          title="Copiar e-mail"
                          aria-label="Copiar e-mail"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </details>

                    <a href={links.github} target="_blank" rel="noreferrer" className="transition hover:opacity-50">
                      GitHub
                    </a>

                    <a href={links.linkedin} target="_blank" rel="noreferrer" className="transition hover:opacity-50">
                      LinkedIn
                    </a>
                    <a href={"http://wa.me/5511989930338"} target="_blank" rel="noreferrer" className="transition hover:opacity-50">
                      Whatsapp
                    </a>
                    <a href={"http://wa.me/5511989930338"} target="_blank" rel="noreferrer" className="transition hover:opacity-50">
                      Currículo
                    </a>

                  </div>
                </div>
              </Scene>
            );
          })}
        </div>
      </main>
    </>
  );
}
