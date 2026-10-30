# Portfólio — Vitor Fernandes

Next.js (App Router) + TypeScript + Tailwind + Three.js.
Paginação horizontal travada, tela 3D do projeto iluminada por um feixe de projetor.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Onde mexer

| O quê | Onde |
| --- | --- |
| Projetos, textos, links | `lib/content.ts` |
| Print de um projeto | coloque em `public/projects/` e aponte em `image` no `lib/content.ts` |
| Conversão sépia / moldura da tela | `lib/screens.ts` |
| Passagem de página (wheel, swipe, teclado, duração) | `hooks/usePager.ts` |
| Feixe, tela e animação 3D | `components/Scene3D.tsx` |
| Cores e fonte | `tailwind.config.ts` |

Projetos sem `image` usam um mock desenhado em `lib/screens.ts` (`mock: 'chart' | 'calendar' | 'list'`).
