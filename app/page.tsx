import Link from "next/link";
import {
  MessageCircle,
  Zap,
  Languages,
  CheckCircle2,
  ArrowRight,
  Store,
  Briefcase,
  ShoppingBag,
  Send,
  Users
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-[#128C7E] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#075E54] font-bold text-xl">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>WA<span className="text-[#128C7E]">Gen</span></span>
          </div>
          <Link 
            href="/generator" 
            className="text-sm font-semibold text-white bg-[#128C7E] px-5 py-2 rounded-full hover:bg-[#0f7569] transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            Launch Free Tool <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#128C7E 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCF8C6]/50 border border-[#DCF8C6] text-[#075E54] text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
             No Sign-up Required
          </div>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
            Still copy-pasting prices? <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#075E54]">
              Stop Typing. Start Closing.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            You're spending hours answering the same "price kiya hai?" and "location bhejen" messages. Instantly generate, personalize, and send high-converting templates in <strong className="text-gray-900 font-bold">English & Roman Urdu</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/generator" 
              className="w-full sm:w-auto text-lg font-bold text-white bg-[#128C7E] px-8 py-4 rounded-full hover:bg-[#0f7569] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Open Generator <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500 font-medium">100% Free &bull; Runs locally in your browser &bull; Zero data collected</p>
        </div>
      </section>

      {/* ICP Section (Who is it for) */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4 tracking-tight">Answering "Price kya hai?" 50 times a day? <br/> This was built for you.</h2>
            <p className="text-gray-600 text-lg">Whether you are pushing a new catalog or chasing pending payments, WA Gen brings the discipline of a professional sales team directly to your chats.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                target: "E-Commerce & Retail",
                description: "Convert 'price please' into confirmed orders instantly. Send catalogs, confirm shipping, and follow up automatically."
              },
              {
                icon: Briefcase,
                target: "Service Providers",
                description: "Book appointments, handle rescheduling, and answer repetitive FAQs without losing your personal touch."
              },
              {
                icon: Store,
                target: "Home Businesses",
                description: "Build immediate trust with professional, bilingual communication that makes you look like a massive operation."
              }
            ].map((icp, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-[#128C7E]/30 transition-colors">
                <div className="w-14 h-14 bg-[#DCF8C6] rounded-2xl flex items-center justify-center mb-6 text-[#075E54]">
                  <icp.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">{icp.target}</h3>
                <p className="text-gray-600 leading-relaxed disabled">{icp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                  Your thumbs deserve a break. <br/>
                  <span className="text-[#128C7E]">Here's how we help.</span>
                </h2>
                <p className="text-lg text-gray-600">
                  We stripped away the clutter and built exactly what you need to sell more via WhatsApp. No bloated CRM, just raw efficiency.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: Languages,
                    title: "Bilingual Intelligence",
                    text: "Fluidly switch between English and Roman Urdu / Hindi to match your customer's perfect vibe."
                  },
                  {
                    icon: Zap,
                    title: "Smart Variable Injection",
                    text: "Load your business name, customer name, and pricing links once. We auto-fill them into every template."
                  },
                  {
                    icon: Send,
                    title: "Direct 'No-Save' Send",
                    text: "Type a number and hit send. Period. Stop clogging your phonebook with one-time inquiries."
                  },
                  {
                    icon: Users,
                    title: "Team Sync (Offline)",
                    text: "Export your master templates and share them via JSON with your sales reps. 100% unified communication."
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-[#128C7E]/10 flex items-center justify-center text-[#128C7E]">
                        <feature.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-heading font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Representation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#128C7E] to-[#25D366] rounded-[40px] transform rotate-3 opacity-20 blur-2xl"></div>
              <div className="bg-white border text-left border-gray-200 rounded-[32px] p-6 shadow-2xl relative z-10 transform -rotate-2">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-2 font-mono text-xs text-gray-400 font-bold uppercase tracking-widest">WA Generator Preview</div>
                </div>
                {/* Fake Chat bubbles */}
                <div className="space-y-4 font-sans">
                   <div className="bg-gray-100 p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl w-[90%] text-sm text-gray-700 leading-relaxed shadow-sm">
                     Price kya hai is red dress ki? Aur delivery mil jayegi Karachi mein?
                   </div>
                   <div className="bg-[#DCF8C6] p-4 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl w-[95%] ml-auto text-sm text-[#111B21] shadow-sm transform translate-x-2 leading-relaxed">
                     <strong className="font-bold">Salam Sara! 👋</strong><br/><br/>
                     Aap <strong className="font-bold">Red Dress</strong> ki mukammal catalog aur latest prices yahan dekh sakte hain: <u>www.acme.com</u><br/><br/>
                     Aur ji bilkul, hum Karachi mein 2 din mein deliver karte hain. Apka address kya houga?
                   </div>
                   <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                     <CheckCircle2 className="w-4 h-4 text-[#128C7E]" /> Sent directly in 0.5s
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-[#075E54] text-center py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-heading md:text-5xl font-bold text-white mb-6 tracking-tight">Your next customer is waiting. <br/> Don't make them wait.</h2>
          <p className="text-[#DCF8C6] text-xl mb-10 leading-relaxed">Stop losing customers to slow replies. Equip your business with rapid-fire responses today.</p>
          <Link 
            href="/generator" 
            className="inline-flex items-center justify-center gap-2 bg-white text-[#075E54] px-10 py-5 rounded-full text-lg font-bold hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
          >
            Launch the Generator Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} WA Template Generator. A free internal tool for local businesses.</p>
      </footer>
    </div>
  );
}
