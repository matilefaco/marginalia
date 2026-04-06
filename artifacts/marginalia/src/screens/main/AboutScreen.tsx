import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { LogoMark } from "@/components/LogoMark";

const APP_VERSION = "0.1.0";

interface LinkRowProps {
  label: string;
  onPress?: () => void;
  external?: boolean;
}

function LinkRow({ label, onPress, external }: LinkRowProps) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center justify-between py-3.5 border-b border-[#454545]/5 hover:opacity-60 transition-opacity text-left"
    >
      <span className="font-sans font-light text-[13px] text-[#454545]/70">{label}</span>
      {external
        ? <ExternalLink className="w-3.5 h-3.5 text-[#454545]/20" />
        : <span className="text-[#454545]/20 text-sm">›</span>
      }
    </button>
  );
}

export function AboutScreen() {
  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/settings">
          <button className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px] text-[#454545]">Sobre o Marginalia</h1>
      </div>

      <div className="px-5 pb-8 space-y-8">

        {/* Identity */}
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="w-14 h-16 mb-4 opacity-80">
            <LogoMark />
          </div>
          <h2 className="font-serif italic text-[26px] text-[#454545] mb-1">Marginalia</h2>
          <p className="font-sans font-light tracking-[0.18em] uppercase text-[9px] text-[#AE8F7D]">
            Leia junto. Sinta junto.
          </p>
        </div>

        {/* What is Marginalia */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              O que é o Marginalia
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-serif italic text-[14px] text-[#454545]/70 leading-relaxed mb-3">
            "Marginalia são as anotações que os leitores fazem nas margens dos livros — pequenas marcas de quem passou por aquelas páginas antes de você."
          </p>
          <p className="font-sans font-light text-[12px] text-[#454545]/55 leading-relaxed">
            O Marginalia é uma plataforma de leitura social onde você registra os trechos que tocaram você, reage ao que outros leitores sentiram, e descobre que não estava sozinho naquela página.
          </p>
          <p className="font-sans font-light text-[12px] text-[#454545]/55 leading-relaxed mt-2">
            Aqui, chamamos suas anotações de <span className="italic">ecos</span> — porque toda leitura ressoa de alguma forma.
          </p>
        </section>

        {/* Version */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Versão
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#454545]/5">
            <span className="font-sans font-light text-[13px] text-[#454545]/70">Versão do app</span>
            <span className="font-sans font-light text-[12px] text-[#AE8F7D]">{APP_VERSION} beta</span>
          </div>
        </section>

        {/* Legal */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Legal
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <LinkRow label="Termos de uso" external />
          <LinkRow label="Política de privacidade" external />
        </section>

        {/* Contact */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Contato
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <LinkRow label="Enviar feedback" />
          <LinkRow label="Reportar um problema" />
          <LinkRow label="Falar com o suporte" external />
        </section>

        <p className="font-serif italic text-[11px] text-[#454545]/25 text-center leading-relaxed pt-2">
          Feito com amor por quem acredita que ler junto é melhor.
        </p>
      </div>
    </div>
  );
}
