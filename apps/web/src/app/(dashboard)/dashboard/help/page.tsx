'use client';

import { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Coins, 
  Tv, 
  Search,
  Check,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Pre-baked Q&A bank
const glitchyAnswers: Record<string, string> = {
  cash: "Ayo! Cash router is simple! Navigate to the Payments tab. Connect your payout gateway (Stripe, UPI, or PayPal). Once your cash reserves cross ₹500, click 'BOOST TRANSFER' and funds will hit your account in 3 minutes flat! Zero corporate delay. 💸⚡",
  checkout: "Totally customizable! Your checkout page features our signature 3D credit card flip. To customize, head to dashboard settings, upload your custom pixel avatar, tweak the color hex values, and toggle the CRT Scanlines. You can even write custom CSS triggers! 🎨👾",
  fees: "No corporate tax here, creator! We run a flat 2.5% gas/arcade fee to keep our servers running high-fidelity audio cassettes. Keep 97.5% of everything you earn! Pro tier members pay a flat 1%. 🌟🕹️",
  player: "Ah, the walkman deck! If the visualizer isn't leaping, make sure your browser isn't blocking audio codecs, or try 'blowing' into the cartridge (just kidding!). Make sure you tap the physical Play button in the community deck to activate the audio transceiver. 🎧🎵",
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState("Ayo! I am GLITCHY v0.9, your Y2K terminal assistant! Pick a shortcut below or type your emergency in my console. Let's build your universe! 👾");
  const [isThinking, setIsThinking] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Triggering the simulated AI Response
  const askGlitchy = (queryKey: string) => {
    setIsThinking(true);
    setAiResponse('');
    
    setTimeout(() => {
      setIsThinking(false);
      const answer = glitchyAnswers[queryKey] || "CONSOLE ERROR: Signal scrambled! I couldn't scan that exact frequency. Type 'cash', 'checkout', 'fees', or 'player' for crystal clear audio feedback! 📡⚡";
      setAiResponse(answer);
    }, 1200);
  };

  const handleCustomQuery = () => {
    if (!searchQuery.trim()) return;
    const queryLower = searchQuery.toLowerCase();
    
    let key = '';
    if (queryLower.includes('cash') || queryLower.includes('withdraw') || queryLower.includes('payout')) key = 'cash';
    else if (queryLower.includes('checkout') || queryLower.includes('card') || queryLower.includes('3d')) key = 'checkout';
    else if (queryLower.includes('fee') || queryLower.includes('cut') || queryLower.includes('percent')) key = 'fees';
    else if (queryLower.includes('audio') || queryLower.includes('cassette') || queryLower.includes('walkman') || queryLower.includes('player')) key = 'player';

    askGlitchy(key);
    setSearchQuery('');
  };

  return (
    <div className="relative space-y-6 pb-20 select-none bg-[radial-gradient(#2c2c2c_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
      
      {/* CRT SCANLINE OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-40 shadow-crt opacity-10 mix-blend-overlay pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="rounded-2xl border-4 border-foreground bg-card shadow-elevated p-6 relative">
        {/* Decorative star doodle */}
        <div className="absolute -top-4 -right-4 text-violet animate-[spin_10s_linear_infinite]">
          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-mango border-2 border-foreground" />
              <span className="font-retro text-sm uppercase tracking-wider text-muted-foreground">
                CONSOLE SUPPORT SYSTEM // BOOTED
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              CREATOR HELPDESK 🚨
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              STUCK IN THE COSMOS? GLITCHY AI & STICKY TERMINALS ARE ARMED.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* LEFT COLUMN: NEON STICKY NOTES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-violet" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              DOCUMENTATION DECK (CLICK TO EXPAND)
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* STICKY 1: SYSTEM SETUP (Magenta) */}
            <motion.div 
              onClick={() => setActiveNote(activeNote === 'setup' ? null : 'setup')}
              className="rounded-2xl border-4 border-foreground bg-violet-100 hover:bg-violet-200 text-foreground p-5 cursor-pointer shadow-flat-md hover:shadow-flat-lg transition-all rotate-[-1.5deg] relative overflow-hidden"
            >
              <div className="absolute top-2 right-3 font-mono text-[9px] text-violet font-bold bg-white border border-foreground px-1.5 py-0.5 rounded">SYSTEM</div>
              <h3 className="font-display text-md font-extrabold uppercase mb-2 flex items-center gap-1.5">
                🚨 EMERGENCY STATS Setup
              </h3>
              <p className="text-xs leading-relaxed font-semibold">
                Struggling with setting up your domain, workspace assets, or integrating your creator profile? 
              </p>
              
              <AnimatePresence>
                {activeNote === 'setup' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-3 border-t-2 border-dashed border-foreground/30 text-xs font-mono space-y-2"
                  >
                    <p className="font-sans font-bold">STEPS TO RESOLVE:</p>
                    <p>1. Open Onboarding Avatar Builder at `/onboarding` to mint your pixel profile card.</p>
                    <p>2. Go to settings under console menu and update DNS to link custom domains.</p>
                    <p>3. If files reject, convert transparent logos to PNG/SVG sprites.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* STICKY 2: CASH FLOW (Cyan) */}
            <motion.div 
              onClick={() => setActiveNote(activeNote === 'cash' ? null : 'cash')}
              className="rounded-2xl border-4 border-foreground bg-cyan/15 hover:bg-cyan/25 text-foreground p-5 cursor-pointer shadow-flat-md hover:shadow-flat-lg transition-all rotate-[1.2deg] relative overflow-hidden"
            >
              <div className="absolute top-2 right-3 font-mono text-[9px] text-cyan-600 font-bold bg-white border border-foreground px-1.5 py-0.5 rounded">REVENUE</div>
              <h3 className="font-display text-md font-extrabold uppercase mb-2 flex items-center gap-1.5">
                💸 INSTANT PAYOUT CONDUIT
              </h3>
              <p className="text-xs leading-relaxed font-semibold">
                Need to transfer your earnings into cash? Our payment system operates with zero corporate gatekeeping.
              </p>

              <AnimatePresence>
                {activeNote === 'cash' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-3 border-t-2 border-dashed border-foreground/30 text-xs font-mono space-y-2"
                  >
                    <p className="font-sans font-bold">DIAGNOSTICS:</p>
                    <p>- Base fees: Flat 2.5% network fee, zero extra subscription cost.</p>
                    <p>- Transfer ceiling: No limit! Transfer as low as ₹500 instantly.</p>
                    <p>- Security protocol: Powered by high-fidelity end-to-end sandbox locks.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* STICKY 3: TACTILE INTERACTIONS (Mango) */}
            <motion.div 
              onClick={() => setActiveNote(activeNote === 'tactile' ? null : 'tactile')}
              className="rounded-2xl border-4 border-foreground bg-mango/15 hover:bg-mango/25 text-foreground p-5 cursor-pointer shadow-flat-md hover:shadow-flat-lg transition-all rotate-[-1deg] relative overflow-hidden"
            >
              <div className="absolute top-2 right-3 font-mono text-[9px] text-mango-700 font-bold bg-white border border-foreground px-1.5 py-0.5 rounded">TACTILE</div>
              <h3 className="font-display text-md font-extrabold uppercase mb-2 flex items-center gap-1.5">
                🕹️ ARCADE PHYSICS COCKPIT
              </h3>
              <p className="text-xs leading-relaxed font-semibold">
                Learn how to customize your dashboard draggable cockpit and customize user-facing features.
              </p>

              <AnimatePresence>
                {activeNote === 'tactile' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-3 border-t-2 border-dashed border-foreground/30 text-xs font-mono space-y-2"
                  >
                    <p className="font-sans font-bold">CONTROLS GUIDE:</p>
                    <p>- Drag elements by clicking and holding the Titlebar grids.</p>
                    <p>- Toggle 'CRT SHADER' in main panel to activate pixel scanlines overlay.</p>
                    <p>- Toggle 'RESET DECK' if components float out of viewport bounds.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* STICKY 4: VIP CODES (Yellow) */}
            <motion.div 
              onClick={() => setActiveNote(activeNote === 'codes' ? null : 'codes')}
              className="rounded-2xl border-4 border-foreground bg-yellow-100 hover:bg-yellow-200 text-foreground p-5 cursor-pointer shadow-flat-md hover:shadow-flat-lg transition-all rotate-[1.5deg] relative overflow-hidden"
            >
              <div className="absolute top-2 right-3 font-mono text-[9px] text-amber-600 font-bold bg-white border border-foreground px-1.5 py-0.5 rounded">CHEAT CODES</div>
              <h3 className="font-display text-md font-extrabold uppercase mb-2 flex items-center gap-1.5">
                ⭐ SECRET ARCADE SHORTCUTS
              </h3>
              <p className="text-xs leading-relaxed font-semibold">
                Unlock high-fidelity keybinds and shortcuts across the Creatorverse Console.
              </p>

              <AnimatePresence>
                {activeNote === 'codes' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-3 border-t-2 border-dashed border-foreground/30 text-xs font-mono space-y-2"
                  >
                    <p className="font-sans font-bold">CONSOLE SHORTCUTS:</p>
                    <p>- [ESC] + [G]: Activate full-canvas Glitch aesthetic shake.</p>
                    <p>- [SPACE]: Pause/Play the cassette player visualizer from anywhere.</p>
                    <p>- [F8]: Re-run diagnostics on your active audience segments.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* PHYSICAL SKETCH DOODLE (Handdrawn arrow SVG) */}
          <div className="hidden md:flex justify-end pr-10 items-center gap-2.5 text-muted-foreground select-none pointer-events-none">
            <span className="font-retro text-md uppercase font-bold tracking-widest text-violet">ASK OUR COPROCESSOR HERE</span>
            <svg className="w-14 h-12 text-violet stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 60 40">
              <path d="M10,10 C25,5 35,25 45,15" strokeLinecap="round" />
              <path d="M38,12 L46,16 L42,24" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: AI AGENT GLITCHY v0.9 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              GLITCHY AI CONSOLE
            </h2>
          </div>

          <Card className="border-4 border-foreground shadow-flat-lg overflow-hidden flex flex-col bg-card">
            
            {/* Win98 styled titlebar */}
            <div className="bg-gradient-cta text-white font-display px-4 py-2 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin-slow" />
                <span className="font-retro text-sm uppercase tracking-wide">COPROCESSOR // GLITCHY.EXE</span>
              </div>
              <div className="h-4 w-4 border border-white/50 bg-black/20 flex items-center justify-center text-[8px] rounded">✖</div>
            </div>

            {/* Bouncy Doodle AI Sprite inside grid background */}
            <div className="p-6 border-b-4 border-foreground bg-muted relative flex flex-col items-center justify-center overflow-hidden">
              
              {/* Dot grid inside AI avatar screen */}
              <div className="absolute inset-0 bg-[radial-gradient(#2c2c2c_0.8px,transparent_0.8px)] [background-size:10px_10px] opacity-15" />
              <div className="absolute inset-0 shadow-crt opacity-10" />

              {/* Animated sprite */}
              <motion.div 
                animate={isThinking ? {
                  scale: [1, 0.9, 1.1, 1],
                  rotate: [0, -10, 10, 0]
                } : {
                  y: [0, -6, 0]
                }}
                transition={isThinking ? {
                  repeat: Infinity,
                  duration: 0.6
                } : {
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'easeInOut'
                }}
                className="w-20 h-20 rounded-2xl border-4 border-foreground bg-white relative flex flex-col items-center justify-center shadow-flat-sm"
              >
                {/* Antennas */}
                <div className="absolute -top-3.5 left-6 w-1 h-3.5 bg-foreground" />
                <div className="absolute -top-5 left-5 w-3 h-3 rounded-full bg-cyan border-2 border-foreground" />

                {/* Eyes */}
                <div className="flex gap-4 mb-2">
                  <motion.div 
                    animate={isThinking ? { height: [8, 2, 8] } : { height: [8, 8, 1, 8] }}
                    transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                    className="w-2.5 bg-foreground rounded-full" 
                  />
                  <motion.div 
                    animate={isThinking ? { height: [8, 2, 8] } : { height: [8, 8, 1, 8] }}
                    transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                    className="w-2.5 bg-foreground rounded-full" 
                  />
                </div>

                {/* Mouth */}
                <motion.div 
                  animate={isThinking ? {
                    width: [12, 20, 12],
                    borderRadius: ["2px", "50%", "2px"]
                  } : {
                    width: 14
                  }}
                  className="h-2 bg-foreground rounded-full" 
                />

                {/* Cyber-cheek blushes */}
                <div className="absolute bottom-4 left-2 w-1.5 h-1 rounded-full bg-violet" />
                <div className="absolute bottom-4 right-2 w-1.5 h-1 rounded-full bg-violet" />
              </motion.div>

              <div className="mt-4 font-retro text-md uppercase font-bold text-foreground text-center">
                {isThinking ? 'THINKING PROTOCOL ACTIVE...' : 'GLITCHY v0.9 // READY'}
              </div>
            </div>

            {/* AI Dialog box */}
            <div className="p-5 flex-1 min-h-[160px] bg-card flex flex-col justify-between space-y-4">
              
              <div className="border-3 border-foreground rounded-xl bg-muted p-4 relative min-h-[110px]">
                <div className="absolute -top-3 left-4 border-2 border-foreground bg-foreground text-white font-mono text-[9px] uppercase px-1.5 rounded">GLITCHY_LOG</div>
                
                {isThinking ? (
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <p className="animate-pulse">📻 CAPTURING FREQUENCY...</p>
                    <div className="h-3 w-full border-2 border-foreground rounded bg-white p-[1px] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.1 }}
                        className="h-full bg-cyan" 
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold leading-relaxed text-foreground">
                    {aiResponse}
                  </p>
                )}
              </div>

              {/* Clickable Quick Diagnostic Shortcuts */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-muted-foreground uppercase block font-bold">CLICK EMERGENCY SHORTCUTS:</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => askGlitchy('cash')}
                    className="border-2 border-foreground bg-violet text-white text-[10px] font-black rounded-lg px-2.5 py-1 shadow-flat-sm active:translate-y-[1px] active:shadow-flat-sm transition-all"
                  >
                    💵 Payout Transfer
                  </button>
                  <button 
                    onClick={() => askGlitchy('checkout')}
                    className="border-2 border-foreground bg-cyan text-foreground text-[10px] font-black rounded-lg px-2.5 py-1 shadow-flat-sm active:translate-y-[1px] active:shadow-flat-sm transition-all"
                  >
                    👾 3D Card Setup
                  </button>
                  <button 
                    onClick={() => askGlitchy('fees')}
                    className="border-2 border-foreground bg-mango text-foreground text-[10px] font-black rounded-lg px-2.5 py-1 shadow-flat-sm active:translate-y-[1px] active:shadow-flat-sm transition-all"
                  >
                    ⭐ Star Fees
                  </button>
                  <button 
                    onClick={() => askGlitchy('player')}
                    className="border-2 border-foreground bg-yellow-100 text-foreground text-[10px] font-black rounded-lg px-2.5 py-1 shadow-flat-sm active:translate-y-[1px] active:shadow-flat-sm transition-all"
                  >
                    🎧 Walkman Lag
                  </button>
                </div>
              </div>

              {/* Terminal search box input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
                    placeholder="Enter keywords..."
                    className="w-full rounded-xl border-3 border-foreground bg-muted p-2 pl-9 text-xs text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-violet"
                  />
                </div>
                <button
                  onClick={handleCustomQuery}
                  disabled={!searchQuery.trim()}
                  className="flex items-center justify-center h-10 w-10 rounded-xl border-3 border-foreground bg-mango shadow-flat-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-flat-md active:translate-x-[1px] active:translate-y-[1px] transition-all flex-shrink-0"
                >
                  <Send className="h-4.5 w-4.5 text-foreground fill-foreground" />
                </button>
              </div>

            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}
