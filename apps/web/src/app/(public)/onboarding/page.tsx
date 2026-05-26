'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, User, Palette, Check, ArrowRight, ArrowLeft, Gamepad2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type HeadColor = 'magenta' | 'cyan' | 'mango' | 'yellow';
type EyesStyle = 'glasses' | 'shades' | 'pixel' | 'hearts';
type MouthStyle = 'smile' | 'grin' | 'visor' | 'retro';
type AccessoryStyle = 'headphones' | 'crown' | 'cap' | 'none';

interface AvatarSpecs {
  color: HeadColor;
  eyes: EyesStyle;
  mouth: MouthStyle;
  accessory: AccessoryStyle;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = Avatar, 2 = Details, 3 = Provisioning
  const [avatar, setAvatar] = useState<AvatarSpecs>({
    color: 'cyan',
    eyes: 'shades',
    mouth: 'smile',
    accessory: 'headphones',
  });
  const [universeName, setUniverseName] = useState('');
  const [creatorRole, setCreatorRole] = useState('Gamer');
  const [isDeploying, setIsDeploying] = useState(false);

  // SVG avatar renderer
  const renderAvatarSVG = (specs: AvatarSpecs, size = 160) => {
    const headColors: Record<HeadColor, string> = {
      magenta: '#FF00B8',
      cyan: '#00E4FF',
      mango: '#A6FF00',
      yellow: '#FFE600',
    };

    const mainColor = headColors[specs.color];

    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
        {/* Pixel style background border grid */}
        <rect x="5" y="5" width="90" height="90" rx="15" fill="#0C0913" stroke="#1C1C1C" strokeWidth="3" />
        <path d="M 0 0 L 100 100 M 100 0 L 0 100" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

        {/* Head */}
        <rect x="25" y="25" width="50" height="50" rx="8" fill={mainColor} stroke="#1C1C1C" strokeWidth="3" />

        {/* Eyes Style */}
        {specs.eyes === 'glasses' && (
          <>
            {/* Left Glass */}
            <rect x="32" y="38" width="14" height="10" rx="2" fill="none" stroke="#1C1C1C" strokeWidth="2.5" />
            {/* Right Glass */}
            <rect x="54" y="38" width="14" height="10" rx="2" fill="none" stroke="#1C1C1C" strokeWidth="2.5" />
            {/* Bridge */}
            <line x1="46" y1="43" x2="54" y2="43" stroke="#1C1C1C" strokeWidth="2.5" />
          </>
        )}
        {specs.eyes === 'shades' && (
          <>
            {/* Sunglasses black bar */}
            <polygon points="28,38 72,38 68,48 32,48" fill="#1C1C1C" rx="2" />
            <polygon points="34,40 46,40 44,46 36,46" fill="#FFF7F3" opacity="0.3" />
            <polygon points="54,40 66,40 64,46 56,46" fill="#FFF7F3" opacity="0.3" />
          </>
        )}
        {specs.eyes === 'pixel' && (
          <>
            {/* Retro visor eye band */}
            <rect x="28" y="39" width="44" height="8" fill="#1C1C1C" />
            <rect x="32" y="41" width="36" height="4" fill="#FF3B30" />
            <rect x="62" y="41" width="4" height="4" fill="#FFE600" />
          </>
        )}
        {specs.eyes === 'hearts' && (
          <>
            {/* Heart Eyes */}
            <path d="M 33 36 C 30 32, 26 36, 33 44 C 40 36, 36 32, 33 36 Z" fill="#FF3B30" stroke="#1C1C1C" strokeWidth="1" />
            <path d="M 67 36 C 64 32, 60 36, 67 44 C 74 36, 70 32, 67 36 Z" fill="#FF3B30" stroke="#1C1C1C" strokeWidth="1" />
          </>
        )}

        {/* Mouth Style */}
        {specs.mouth === 'smile' && (
          <path d="M 38 60 Q 50 68 62 60" fill="none" stroke="#1C1C1C" strokeWidth="3" strokeLinecap="round" />
        )}
        {specs.mouth === 'grin' && (
          <>
            <rect x="38" y="58" width="24" height="8" rx="2" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2.5" />
            <line x1="50" y1="58" x2="50" y2="66" stroke="#1C1C1C" strokeWidth="1.5" />
          </>
        )}
        {specs.mouth === 'visor' && (
          <rect x="42" y="60" width="16" height="4" rx="1" fill="#1C1C1C" />
        )}
        {specs.mouth === 'retro' && (
          <>
            {/* mustache */}
            <path d="M 35 58 Q 50 56 65 58 Q 50 68 35 58 Z" fill="#1C1C1C" />
            <circle cx="50" cy="63" r="2.5" fill="#FF3B30" />
          </>
        )}

        {/* Accessory */}
        {specs.accessory === 'headphones' && (
          <>
            {/* Headphone Band */}
            <path d="M 23 45 A 27 27 0 0 1 77 45" fill="none" stroke="#1C1C1C" strokeWidth="4.5" />
            {/* Left Ear cup */}
            <rect x="20" y="38" width="8" height="20" rx="3" fill="#FFE600" stroke="#1C1C1C" strokeWidth="2.5" />
            {/* Right Ear cup */}
            <rect x="72" y="38" width="8" height="20" rx="3" fill="#FFE600" stroke="#1C1C1C" strokeWidth="2.5" />
          </>
        )}
        {specs.accessory === 'crown' && (
          <polygon points="26,27 34,14 50,22 66,14 74,27 26,27" fill="#FFE600" stroke="#1C1C1C" strokeWidth="2.5" />
        )}
        {specs.accessory === 'cap' && (
          <>
            <path d="M 26 27 C 26 15, 74 15, 74 27 Z" fill="#FF00B8" stroke="#1C1C1C" strokeWidth="2.5" />
            <polygon points="68,27 88,27 82,32 68,32" fill="#00E4FF" stroke="#1C1C1C" strokeWidth="2" />
          </>
        )}
      </svg>
    );
  };

  const handleFinishOnboarding = () => {
    setIsDeploying(true);
    // Simulate deployment processing
    setTimeout(() => {
      router.push('/dashboard');
      setIsDeploying(false);
    }, 2000);
  };

  const colorsOption: HeadColor[] = ['cyan', 'magenta', 'mango', 'yellow'];
  const eyesOption: EyesStyle[] = ['shades', 'glasses', 'pixel', 'hearts'];
  const mouthOption: MouthStyle[] = ['smile', 'grin', 'visor', 'retro'];
  const accessoryOption: AccessoryStyle[] = ['headphones', 'crown', 'cap', 'none'];

  const stepPercentage = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <main className="min-h-screen relative overflow-hidden bg-snow py-12 px-4 dark:bg-midnight text-foreground">
      {/* Background neon visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:opacity-[0.02]" />

      <div className="mx-auto max-w-4xl relative z-10">
        {/* Onboarding Game HUD (Header) */}
        <div className="flex flex-col md:flex-row items-center justify-between border-3 border-border bg-card p-4 rounded-xl shadow-[-3px_3px_0px_rgba(28,28,28,1)] dark:bg-midnight-soft mb-8">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-6 w-6 text-mango animate-bounce" />
            <div>
              <span className="font-retro text-[10px] text-muted-foreground uppercase tracking-widest block">CREATORVERSE DEPLOYMENT CONSOLE</span>
              <h2 className="font-display text-lg font-black uppercase text-foreground">INITIAL BOOT SYSTEM</h2>
            </div>
          </div>
          {/* XP/HP Health Bar */}
          <div className="w-full md:w-64 mt-4 md:mt-0">
            <div className="flex justify-between font-retro text-[10px] text-muted-foreground font-black">
              <span>DEPLOY SYNC PROGRESS:</span>
              <span className="text-violet">{stepPercentage}% COORD</span>
            </div>
            <div className="h-4 w-full rounded border-2 border-border bg-midnight p-0.5 mt-1 overflow-hidden">
              <motion.div
                animate={{ width: `${stepPercentage}%` }}
                className="h-full bg-violet rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* STEP WORKSPACES */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-8 md:grid-cols-12"
            >
              {/* Left Column: Real-time visual preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-3 border-border bg-card p-8 rounded-xl shadow-[-5px_5px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised relative overflow-hidden shadow-crt">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]" />
                <h4 className="font-retro text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">AVATAR PREVIEW.log</h4>
                {renderAvatarSVG(avatar, 200)}
                <div className="mt-6 rounded border border-border/20 bg-midnight/35 p-2 font-retro text-[11px] text-center w-full uppercase font-black tracking-wide text-cyan-300">
                  ⚡ CONFIG: {avatar.color}-{avatar.eyes}-{avatar.accessory}
                </div>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="md:col-span-7 border-3 border-border bg-card p-6 rounded-xl shadow-[-5px_5px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised space-y-6">
                <div>
                  <span className="inline-block rounded border border-border bg-violet px-2.5 py-0.5 font-retro text-[10px] font-black text-white">STEP 1 // DECK CREATOR</span>
                  <h3 className="mt-3 font-display text-2xl font-black uppercase">DESIGN YOUR PIXEL AVATAR</h3>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground leading-normal">
                    Flesh out your creator digital model. Accessories and colors will render instantly in your system dashboards.
                  </p>
                </div>

                {/* Theme Color selectors */}
                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <Palette className="h-4.5 w-4.5" /> COLOR CODE
                  </label>
                  <div className="flex gap-3">
                    {colorsOption.map((c) => {
                      const hexes = { cyan: 'bg-cyan', magenta: 'bg-violet', mango: 'bg-mango', yellow: 'bg-[#FFE600]' };
                      const activeRing = avatar.color === c ? 'border-4 border-border ring-3 ring-violet' : 'border-2 border-border';
                      return (
                        <button
                          key={c}
                          onClick={() => setAvatar({ ...avatar, color: c })}
                          className={`h-11 w-11 rounded-full cursor-pointer transition-all ${hexes[c]} ${activeRing} active:scale-95`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Eyes style selector */}
                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-2">
                    EYES / LENS STYLE
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {eyesOption.map((e) => {
                      const active = avatar.eyes === e ? 'bg-violet text-white border-violet shadow-neon-magenta' : 'bg-white hover:bg-zinc-50 dark:bg-midnight dark:hover:bg-midnight-soft';
                      return (
                        <button
                          key={e}
                          onClick={() => setAvatar({ ...avatar, eyes: e })}
                          className={`py-2 px-3 border-2 border-border rounded-lg font-retro text-xs font-black uppercase shadow-sm cursor-pointer active:scale-95 transition-all ${active}`}
                        >
                          {e}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mouth style selector */}
                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-2">
                    EXPRESSION CODE
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {mouthOption.map((m) => {
                      const active = avatar.mouth === m ? 'bg-cyan text-border border-cyan shadow-neon-cyan' : 'bg-white hover:bg-zinc-50 dark:bg-midnight dark:hover:bg-midnight-soft';
                      return (
                        <button
                          key={m}
                          onClick={() => setAvatar({ ...avatar, mouth: m })}
                          className={`py-2 px-3 border-2 border-border rounded-lg font-retro text-xs font-black uppercase shadow-sm cursor-pointer active:scale-95 transition-all ${active}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accessories selector */}
                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-2">
                    ACCESSORY MODULES
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {accessoryOption.map((a) => {
                      const active = avatar.accessory === a ? 'bg-mango text-border border-mango shadow-neon-green' : 'bg-white hover:bg-zinc-50 dark:bg-midnight dark:hover:bg-midnight-soft';
                      return (
                        <button
                          key={a}
                          onClick={() => setAvatar({ ...avatar, accessory: a })}
                          className={`py-2 px-3 border-2 border-border rounded-lg font-retro text-xs font-black uppercase shadow-sm cursor-pointer active:scale-95 transition-all ${active}`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action button */}
                <div className="border-t border-border/20 pt-4 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    className="py-6 px-6 font-display font-black text-sm uppercase tracking-wider border-2 border-border bg-violet text-white shadow-[-3px_3px_0px_rgba(28,28,28,1)] active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] hover:-translate-y-1 transition-all"
                  >
                    NEXT CONFIG STEP <ArrowRight className="ml-2 h-4 w-4 stroke-[3px]" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto border-3 border-border bg-card p-8 rounded-xl shadow-[-5px_5px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised space-y-6"
            >
              <div>
                <span className="inline-block rounded border border-border bg-cyan px-2.5 py-0.5 font-retro text-[10px] font-black text-border">STEP 2 // DETAILS</span>
                <h3 className="mt-3 font-display text-2xl font-black uppercase">INITIALIZE YOUR UNIVERSE</h3>
                <p className="mt-1 text-sm font-semibold text-muted-foreground leading-normal">
                  Give your creator digital playground a unique Y2K universe name and identify your main role focus.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-1.5">
                    UNIVERSE BRAND NAME
                  </label>
                  <Input
                    className="border-2 border-border focus-visible:ring-violet font-retro uppercase font-black"
                    placeholder="e.g. ULTRA ARCADE HYPE"
                    value={universeName}
                    onChange={(e) => setUniverseName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-retro text-xs font-black uppercase text-muted-foreground mb-2">
                    CREATOR ROLE/VIBE FOCUS
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Gamer', 'Edu-Coach', 'Streamer', 'Artist', 'Tech-Hacker', 'Podcaster'].map((role) => {
                      const active = creatorRole === role ? 'bg-cyan text-border border-cyan shadow-neon-cyan' : 'bg-white hover:bg-zinc-50 dark:bg-midnight dark:hover:bg-midnight-soft';
                      return (
                        <button
                          key={role}
                          onClick={() => setCreatorRole(role)}
                          className={`py-3 px-4 border-2 border-border rounded-lg font-retro text-xs font-black uppercase text-center cursor-pointer transition-all active:scale-95 ${active}`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="border-t border-border/20 pt-6 flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="py-6 px-6 font-display font-black text-sm uppercase tracking-wider border-2 border-border shadow-[-2.5px_2.5px_0px_rgba(28,28,28,1)] active:translate-y-[2.5px] active:-translate-x-[2.5px] active:shadow-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 stroke-[3px]" /> GO BACK
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!universeName.trim()}
                  className="py-6 px-6 font-display font-black text-sm uppercase tracking-wider border-2 border-border bg-violet text-white shadow-[-3px_3px_0px_rgba(28,28,28,1)] active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] hover:-translate-y-1 transition-all"
                >
                  ASSEMBLE METADATA <ArrowRight className="ml-2 h-4 w-4 stroke-[3px]" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto border-3 border-border bg-card p-8 rounded-xl shadow-[-8px_8px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised text-center relative overflow-hidden shadow-crt"
            >
              <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]" />

              <span className="inline-block rounded border-2 border-border bg-mango px-3 py-1 font-retro text-xs font-bold text-border shadow-[-2px_2px_0px_rgba(28,28,28,1)] mb-4">
                ★ SYNAPSE DEPLOY READY ★
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-foreground">PROVISIONING CONSOLE</h3>
              <p className="mt-2 text-sm font-semibold text-muted-foreground max-w-md mx-auto">
                Ready to sync database logs, map system assets, and launch your customized Y2K creator cockpit.
              </p>

              {/* Final Config Recaps card */}
              <div className="my-6 rounded-lg border-2 border-border bg-[#0D0A14] p-5 text-left text-white shadow-inner relative overflow-hidden">
                <div className="flex items-center gap-4 border-b border-border/20 pb-4 mb-4">
                  {renderAvatarSVG(avatar, 80)}
                  <div>
                    <span className="font-retro text-[8px] text-cyan-400 block tracking-wider">CREATOR ID SYNCHRONIZED</span>
                    <h4 className="font-display text-xl font-black text-snow truncate max-w-[240px]">
                      {universeName.toUpperCase()}
                    </h4>
                    <span className="rounded bg-violet border border-border px-1.5 py-0.5 font-retro text-[9px] font-black tracking-wide text-white mt-1.5 inline-block">
                      ROLE: {creatorRole.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[9px] text-zinc-400 uppercase">
                  <div>&gt; SYNC_METADATA_STREAM: RESOLVED</div>
                  <div>&gt; MOCK_ORDER_STRIPE: PROVISIONED</div>
                  <div>&gt; HYPE_ENGAGEMENT_MULTIPLIER: ACTIVATED</div>
                  <div className="text-mango animate-pulse font-bold">&gt; SYSTEM STATUS: STABLE FOR BOOT</div>
                </div>
              </div>

              {/* Loading progress when deploying */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 text-left font-retro"
                  >
                    <div className="flex justify-between text-[10px] text-violet font-bold">
                      <span>SYNCING MATRIX SEED...</span>
                      <span>COMPILING ASSETS</span>
                    </div>
                    <div className="mt-1 h-3.5 w-full rounded border border-border bg-midnight p-0.5 overflow-hidden">
                      <motion.div
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-violet rounded-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Deployment action buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={isDeploying}
                  variant="outline"
                  className="w-1/3 py-6 font-display font-black text-sm uppercase border-2 border-border shadow-[-2.5px_2.5px_0px_rgba(28,28,28,1)] active:translate-y-[2.5px] active:-translate-x-[2.5px] active:shadow-none"
                >
                  BACK
                </Button>
                <Button
                  onClick={handleFinishOnboarding}
                  disabled={isDeploying}
                  className="w-2/3 py-6 font-display font-black text-sm uppercase tracking-wider border-2 border-border bg-violet text-white shadow-[-3px_3px_0px_rgba(28,28,28,1)] active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] hover:-translate-y-1 transition-all"
                >
                  {isDeploying ? 'BOOTING SYSTEM...' : 'DEPLOY CREATOR CONSOLE'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
