import { useApp } from "@/context/AppContext";

interface PremiumGateProps {
  feature: string;
  description: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const { currentUser } = useApp();

  const isLocked = false;

  if (isLocked && !currentUser) {
    return (
      <div className="rounded-[14px] border border-[#AE8F7D]/20 bg-[#EBE6DB]/30 px-5 py-6 text-center">
        <span className="text-[#AE8F7D] text-lg block mb-2">✦</span>
        <p className="font-sans text-[13px] font-light text-[#3D3D3D] mb-1">{feature}</p>
        <p className="font-sans text-[11px] font-light text-[#7A726A] mb-4">{description}</p>
        <button className="font-sans text-[9px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/35 rounded-full px-5 py-2 hover:bg-[#AE8F7D]/8 transition-colors">
          Conhecer Marginalia Plus
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
