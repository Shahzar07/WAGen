"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  MessageCircle,
  Building2,
  UserCircle,
  Link as LinkIcon,
  Languages,
  Send,
  Search,
  User,
  Star,
  Plus,
  Phone,
  Package,
  Trash2,
  X,
  Download,
  Upload,
  QrCode,
  BarChart3,
  Share2,
  ArrowLeft
} from "lucide-react";

type Language = "en" | "ur";

type Template = {
  id: string;
  en: string;
  ur: string;
};

type Category = {
  id: string;
  name: string;
  templates: Template[];
};

type HistoryItem = {
  id: string;
  text: string;
  timestamp: number;
};

const QUICK_REPLIES: Record<string, string[]> = {
  general: ["Yes, absolutely!", "No problem.", "Please let me know.", "I'll check and revert."],
  pricing: ["We also offer bulk discounts.", "Prices are subject to change.", "Would you like a custom quote?", "Does this fit your budget?"],
  promotions: ["Order now, stock is limited!", "This offer expires soon.", "Share this with your friends!", "Ready to order?"],
  booking: ["Should I lock this in?", "Please bring your ID.", "Let me know if you need to reschedule.", "See you then!"],
  order: ["Thanks for your patience.", "Let me double check.", "Can I help with anything else?", "Your tracking number will be sent soon."],
  support: ["I'm looking into this now.", "Thanks for bringing this to our attention.", "Can you send a screenshot?", "Is there a better time to call you?"],
  payments: ["Let me know if you face any issues.", "We accept cards and bank transfers.", "Thanks for the swift payment!", "Receipt attached."],
  feedback: ["We'd appreciate a 5-star rating!", "Your feedback helps us grow.", "Thanks for being awesome.", "We'd love to hear more."],
  greetings: ["Have a wonderful day!", "Stay safe!", "Best wishes from our team.", "Looking forward to serving you again."],
  custom: ["Got it.", "Thanks again.", "Let me know your thoughts.", "Appreciate it!"]
};

const CATEGORIES: Category[] = [
  {
    id: "general",
    name: "General Inquiry",
    templates: [
      {
        id: "gen-1",
        en: "[Greeting] [Customer Name]! Thanks for reaching out to [Business Name]. How can we assist you today?",
        ur: "[Greeting] [Customer Name]! [Business Name] se contact karne ka shukriya. Hum aaj aapki kaise madad kar sakte hain?",
      },
      {
        id: "gen-2",
        en: "[Greeting] [Customer Name]! We have received your message. A member of our team will get back to you shortly.",
        ur: "[Greeting] [Customer Name]! Humien aapka message mil gaya hai. Hamari team jald hi aapse raabta karegi.",
      },
      {
        id: "gen-3",
        en: "Welcome to [Business Name]! For quick answers, you can check out our website: [Link]",
        ur: "[Business Name] mein khush amdeed! Jaldi jawabat ke liye aap hamari website dekh sakte hain: [Link]",
      },
      {
        id: "gen-4",
        en: "[Greeting]! I'm [Contact Person] from [Business Name]. Let me know what you're looking for so I can help!",
        ur: "[Greeting]! Main [Business Name] se [Contact Person] baat kar raha hoon. Boliye main aapki kya madad karoon?",
      },
      {
        id: "gen-5",
        en: "Thank you for your interest in [Business Name]. Our working hours are 9 AM to 6 PM. We'll reply soon!",
        ur: "[Business Name] mein dilchaspi ka shukriya. Hamare kaam ke auqat subah 9 se shaam 6 baje hain. Hum jald reply karenge!",
      },
      {
        id: "gen-6",
        en: "Hello! We are currently experiencing a high volume of messages, but we will get to yours ASAP.",
        ur: "Hello! Abhi messages bohat zyada aarahe hain, lekin hum jald az jald aapko reply karenge.",
      },
      {
        id: "gen-7",
        en: "Hi there! How did you hear about [Business Name]? Let us know how we can best serve you.",
        ur: "Salam! Aapko [Business Name] ke baare mein kahan se pata chala? Hum aapki kya khidmat kar sakte hain?",
      },
    ],
  },
  {
    id: "pricing",
    name: "Pricing/Catalog",
    templates: [
      {
        id: "price-1",
        en: "[Greeting] [Customer Name]! You can view our full catalog and latest prices for [Product Name] right here: [Link] Let me know if you need help choosing.",
        ur: "[Greeting] [Customer Name]! Aap [Product Name] ki mukammal catalog aur latest prices yahan dekh sakte hain: [Link] Agar koi madad chahiye toh batayein.",
      },
      {
        id: "price-2",
        en: "Hello! Our pricing and packages are detailed on our website: [Link] Would you like me to highlight our best sellers?",
        ur: "Hello! Hamari pricing aur packages ki details website par hain: [Link] Kya main aapko best sellers dikhaun?",
      },
      {
        id: "price-3",
        en: "Hi there! Yes, we have exactly what you're looking for at [Business Name]. Check out the options: [Link]",
        ur: "Salam! Jee haan, jo aap dhoond rahe hain wo hamare paas hai. [Business Name] par options check karien: [Link]",
      },
      {
        id: "price-4",
        en: "Thank you for asking! We are currently running a special discount. Check [Link] for the latest deals.",
        ur: "Poochne ka shukriya! Abhi hamara ek special discount chal raha hai. Latest deals ke liye [Link] check karein.",
      },
      {
        id: "price-5",
        en: "Hi, I'm [Contact Person]. I can help you find the best plan for your budget. What range are you looking at?",
        ur: "Salam, main [Contact Person] hoon. Main aapke budget ke mutabiq best plan dhoondne mein madad kar sakta hoon. Aapki range kya hai?",
      },
      {
        id: "price-6",
        en: "Our standard starting price for [Product Name] is detailed here. We also offer custom quotes!",
        ur: "[Product Name] ki starting price yahan par mojood hai. Hum custom quotes bhi offer karte hain!",
      },
      {
        id: "price-7",
        en: "Check out our bundle offers for [Product Name]! You can save more by purchasing in bulk: [Link]",
        ur: "[Product Name] ke bundle offers check karien! Sath lene se aap zyada bachat kar sakte hain: [Link]",
      },
      {
        id: "price-8",
        en: "Just a quick update: The prices for [Product Name] will be increasing next week. Lock in your price today!",
        ur: "Ek choti si update: [Product Name] ki prices agle haftay se barh jayen gi. Aaj hi order confirm karien!",
      },
    ],
  },
  {
    id: "promotions",
    name: "Promotions/Sales",
    templates: [
      {
        id: "promo-1",
        en: "[Greeting] [Customer Name]! We just launched a massive Flash Sale on [Product Name]. Grab it before it's gone: [Link]",
        ur: "[Greeting] [Customer Name]! Humne abhi [Product Name] par Flash Sale lagayi hai. Khatam hone se pehle khareed lein: [Link]",
      },
      {
        id: "promo-2",
        en: "Exclusive offer for you! Get an extra 15% off at [Business Name] using checkout code VIP15. Shop now: [Link]",
        ur: "Aap ke liye exclusive offer! [Business Name] par checkout code VIP15 use kar ke extra 15% off haasil karein: [Link]",
      },
      {
        id: "promo-3",
        en: "Buy 1 Get 1 Free on all [Product Name]! This weekend only. Don't miss out.",
        ur: "Tamam [Product Name] par Buy 1 Get 1 Free! Sirf is weekend ke liye.",
      },
      {
        id: "promo-4",
        en: "Hi [Customer Name]! We added new stock to our clearance section. Everything must go! Browse here: [Link]",
        ur: "Salam [Customer Name]! Humne clearance stock update kiya hai. Sab kuch sale par hai! Yahan dekhein: [Link]",
      },
      {
        id: "promo-5",
        en: "Surprise! We are offering free shipping on all orders over Rs. 2000 for the next 24 hours.",
        ur: "Surprise! Agle 24 ghanton ke liye Rs. 2000 se oopar ke tamam orders par free shipping.",
      },
      {
        id: "promo-6",
        en: "Early Access! As a valued customer, you get to shop our [Product Name] sale 24 hours early: [Link]",
        ur: "Early Access! Hamare khaas customer hone ki wajah se aap sale 24 ghante pehle access kar sakte hain: [Link]",
      },
      {
        id: "promo-7",
        en: "Refer a friend to [Business Name] and both of you get 20% off your next purchase!",
        ur: "Apne dost ko [Business Name] refer karien aur dono apni agli khareedari par 20% off payen!",
      },
    ]
  },
  {
    id: "booking",
    name: "Booking/Appointment",
    templates: [
      {
        id: "book-1",
        en: "To book an appointment at [Business Name], please choose an available slot using this link: [Link]",
        ur: "[Business Name] mein appointment book karne ke liye, baraye meharbani is link se slot chunein: [Link]",
      },
      {
        id: "book-2",
        en: "Hi [Customer Name]! Let's get you booked. What date and time works best for you?",
        ur: "Salam [Customer Name]! Chaliye aapki booking karte hain. Aapko kaunsi date aur time behtar lagega?",
      },
      {
        id: "book-3",
        en: "Thank you! Your appointment with [Contact Person] at [Business Name] is now confirmed.",
        ur: "Shukriya! [Business Name] mein [Contact Person] ke sath aapki appointment confirm ho gayi hai.",
      },
      {
        id: "book-4",
        en: "Hello [Customer Name], this is a reminder for your upcoming appointment. Please let us know if you need to reschedule.",
        ur: "Hello [Customer Name], yeh aapki aane wali appointment ka reminder hai. Agar aapko time change karna ho toh bata dein.",
      },
      {
        id: "book-5",
        en: "Sorry, we are fully booked on that date. Can we suggest an alternative time?",
        ur: "Maazrat, us date par hum fully booked hain. Kya hum koi aur time suggest kar sakte hain?",
      },
      {
        id: "book-6",
        en: "Your booking for [Product Name] is almost complete! Please confirm within 1 hour to secure your spot.",
        ur: "Aapki [Product Name] ki booking almost muqammal hai! Baraye mehari apni spot secure karne ke liye 1 ghante mein confirm karein.",
      },
      {
        id: "book-7",
        en: "Please note that a 20% advance deposit is required to confirm your booking for [Product Name].",
        ur: "Apni booking confirm karne ke liye baraye meharbani 20% advance jama karwaden.",
      },
    ],
  },
  {
    id: "order",
    name: "Order Status",
    templates: [
      {
        id: "ord-1",
        en: "[Greeting] [Customer Name]! Your order for [Product Name] from [Business Name] has been confirmed and is being processed.",
        ur: "[Greeting] [Customer Name]! [Business Name] se aapka [Product Name] ka order confirm ho gaya hai aur process ho raha hai.",
      },
      {
        id: "ord-2",
        en: "Good news! Your order is out for delivery. You can track it here: [Link]",
        ur: "Khushkhabri! Aapka order delivery ke liye nikal chuka hai. Yahan track karein: [Link]",
      },
      {
        id: "ord-3",
        en: "Hello, we have received your payment. Your order will be shipped shortly.",
        ur: "Hello, humien aapki payment mil gayi hai. Aapka order jald hi ship ho jayega.",
      },
      {
        id: "ord-4",
        en: "Hi [Customer Name], your order for [Product Name] from [Business Name] is ready for pickup. See you soon!",
        ur: "Salam [Customer Name], [Business Name] se aapka [Product Name] ka order pickup ke liye ready hai. Jald milte hain!",
      },
      {
        id: "ord-5",
        en: "Apologies for the delay. I'm [Contact Person] and I am personally tracking your order to give you an update.",
        ur: "Deri ke liye maazrat. Main [Contact Person] hoon aur main khud aapke order ko track kar raha hoon update dene ke liye.",
      },
      {
        id: "ord-6",
        en: "Your order is taking slightly longer than expected due to high volume. We appreciate your patience!",
        ur: "Aapka order expected time se thora zyada time le raha hai. Sabar ka shukriya!",
      },
      {
        id: "ord-7",
        en: "Oops! We encountered an issue with your shipping address. Could you double-check it for us?",
        ur: "Oops! Aapke shipping address ke saath ek masla aaraha hai. Kya aap confirm kar sakte hain?",
      },
    ],
  },
  {
    id: "support",
    name: "Customer Support",
    templates: [
      {
        id: "sup-1",
        en: "We're sorry to hear you're experiencing an issue. Let's get this fixed for you right away.",
        ur: "Humien afsos hai ke aapko masla pesh aa raha hai. Aiye isay abhi theek karte hain.",
      },
      {
        id: "sup-2",
        en: "Hi, I'm [Contact Person]. Could you please provide your order details so I can check?",
        ur: "Salam, main [Contact Person] hoon. Kya aap apne order ki details bata sakte hain taa kay main check kar sakun?",
      },
      {
        id: "sup-3",
        en: "Here is a helpful guide that might solve your problem: [Link]",
        ur: "Yeh ek helpful guide hai jo shayad aapka masla hal kar de: [Link]",
      },
      {
        id: "sup-4",
        en: "Thank you for your feedback! We always aim to improve the experience at [Business Name].",
        ur: "Aapke feedback ka shukriya! [Business Name] mein hum hamesha apna experience behtar karne ki koshish karte hain.",
      },
      {
        id: "sup-5",
        en: "Is there anything else I can help you with today?",
        ur: "Kya koi aur cheez hai jisme main aaj aapki madad kar sakun?",
      },
      {
        id: "sup-6",
        en: "We have updated your account as requested. Please check and let us know if it looks good.",
        ur: "Aapki request ke mutabiq humne account update kar diya hai. Barae meharbani check kar ke confirm karein.",
      },
      {
        id: "sup-7",
        en: "Just checking in! Did our last resolution fix the issue you were having with [Product Name]?",
        ur: "Just checking in! Kya hamari aakhiri guide se aapka masla hal ho gaya tha?",
      },
    ],
  },
  {
    id: "payments",
    name: "Payment Reminders",
    templates: [
      {
        id: "pay-1",
        en: "Hi [Customer Name], this is a gentle reminder that your payment is due. Please process it at your earliest convenience.",
        ur: "Salam [Customer Name], yeh ek reminder hai ke aapki payment pending hai. Baraye meharbani jald az jald process karein.",
      },
      {
        id: "pay-2",
        en: "Hello, we noticed your payment for the recent order hasn't cleared yet. Here is the payment link: [Link]",
        ur: "Hello, aapke pichle order ki payment abhi clear nahi hui hai. Yeh raha payment link: [Link]",
      },
      {
        id: "pay-3",
        en: "We have successfully received your payment! Thank you for your prompt response.",
        ur: "Humien aapki payment mil gayi hai! Jald reply karne ka shukriya.",
      },
      {
        id: "pay-4",
        en: "Hi [Customer Name], your subscription will renew soon. Let us know if you need to update any details.",
        ur: "Salam [Customer Name], aapki subscription jald renew hone wali hai. Agar koi details change karni hain toh bata dien.",
      },
      {
        id: "pay-5",
        en: "Hi, please send a screenshot of your payment receipt once the transfer is done so we can proceed.",
        ur: "Salam, payment complete hone ke baad receipt ka screenshot bhej dien taa kay hum order aage process karien.",
      },
      {
        id: "pay-6",
        en: "URGENT: Your invoice is past due. Please pay immediately using [Link] to avoid suspension of services.",
        ur: "URGENT: Aapki invoice due date cross kar chuki hai. Services rukne se bachne ke liye foran [Link] par pay karein.",
      },
      {
        id: "pay-7",
        en: "Did you encounter any issues while trying to make the payment? I am here to help troubleshoot.",
        ur: "Kya payment karne mein koi masla aa raha hai? Main madad karne ke liye mojood hoon.",
      },
    ]
  },
  {
    id: "feedback",
    name: "Feedback/Reviews",
    templates: [
      {
        id: "fb-1",
        en: "Hi [Customer Name]! Hope you loved your recent purchase. Would you mind leaving us a quick review? [Link]",
        ur: "Salam [Customer Name]! Umeed hai aapko hamara product pasand aya hoga. Ek qeemti review de kar hamari hosla afzai karein: [Link]",
      },
      {
        id: "fb-2",
        en: "Your opinion matters to us at [Business Name]. Let us know how we did today!",
        ur: "[Business Name] mein aapki raye hamare liye ahem hai. Humien batayein hamne kaisa service di!",
      },
      {
        id: "fb-3",
        en: "Thank you for the fantastic review! We are thrilled to hear you had a great experience.",
        ur: "Behtareen review ka shukriya! Humien jaan kar khushi hui ke aapka tajarba acha raha.",
      },
      {
        id: "fb-4",
        en: "We're sorry we didn't meet your expectations. I'm [Contact Person] and I'd like to personally resolve this.",
        ur: "Humien afsos hai ke hum aapki tawaquaat par poore nahi utre. Main [Contact Person] hoon aur isay khud hal karna chahta hoon.",
      },
      {
        id: "fb-5",
        en: "We would love to feature your feedback on our page! Can we use your review?",
        ur: "Hum aapka review apne page par lagana chahte hain! Kya hum isay use kar sakte hain?",
      },
      {
        id: "fb-6",
        en: "As a thank you for your kind review, here is a 10% off coupon for your next purchase: THANKYOU10",
        ur: "Aapke ache review ke shukriye ke taur par, yeh lijiye agli khareedari ke liye 10% off coupon: THANKYOU10",
      },
    ]
  },
  {
    id: "greetings",
    name: "Greetings/Holiday",
    templates: [
      {
        id: "greet-1",
        en: "Wishing you a joyous holiday season from all of us at [Business Name]! Enjoy a special 10% off using code HOLIDAY2024.",
        ur: "[Business Name] ki taraf se aapko bohot bohot mubarakbad! Code HOLIDAY2024 istemal kar ke 10% discount haasil karein.",
      },
      {
        id: "greet-2",
        en: "Happy Holidays [Customer Name]! Please note our stores will be closed tomorrow.",
        ur: "Chutiyan Mubarak [Customer Name]! Kal hamara store band rahega.",
      },
      {
        id: "greet-3",
        en: "Eid Mubarak! May this beautiful occasion bring you joy and prosperity. Sincerely, [Contact Person].",
        ur: "Eid Mubarak! Allah aapko bohot si khushiyan ata farmaye. Dua-go, [Contact Person].",
      },
      {
        id: "greet-4",
        en: "Ramadan Mubarak! Check out our special Ramadan deals at [Link].",
        ur: "Ramadan Mubarak! Hamari special deals check karne ke liye is [Link] par jayen.",
      },
      {
        id: "greet-5",
        en: "Happy New Year! Thank you for your continued support to [Business Name]!",
        ur: "Naya Saal Mubarak! [Business Name] ka sath dene ka bohot shukriya!",
      },
      {
        id: "greet-6",
        en: "Independence Day Sale! Celebrate with us and grab exciting offers at [Link]",
        ur: "Jashn-e-Azadi Mubarak! Hamare sath celebrate karein aur dilchasp offers haasil karein: [Link]",
      },
    ]
  }
];

export default function WhatsAppTemplateGen() {
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [newTplEn, setNewTplEn] = useState("");
  const [newTplUr, setNewTplUr] = useState("");
  
  const [stats, setStats] = useState({ copied: 0, sent: 0 });
  const [mounted, setMounted] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [draftMessage, setDraftMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const [language, setLanguage] = useState<Language>("en");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedBN = localStorage.getItem("bn");
    if (savedBN) setBusinessName(savedBN);
    const savedCP = localStorage.getItem("cp");
    if (savedCP) setContactPerson(savedCP);
    const savedWL = localStorage.getItem("wl");
    if (savedWL) setWebsiteLink(savedWL);
    const savedBPh = localStorage.getItem("bph");
    if (savedBPh) setBusinessPhone(savedBPh);
    const savedCN = localStorage.getItem("cn");
    if (savedCN) setCustomerName(savedCN);
    const savedPhone = localStorage.getItem("cph");
    if (savedPhone) setCustomerPhone(savedPhone);
    const savedPN = localStorage.getItem("pn");
    if (savedPN) setProductName(savedPN);
    const savedFavs = localStorage.getItem("favs");
    if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
    const savedCustom = localStorage.getItem("customTpls");
    if (savedCustom) setCustomTemplates(JSON.parse(savedCustom));
    const savedStats = localStorage.getItem("usageStats");
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedHistory = localStorage.getItem("waHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("bn", businessName);
    localStorage.setItem("cp", contactPerson);
    localStorage.setItem("wl", websiteLink);
    localStorage.setItem("bph", businessPhone);
    localStorage.setItem("cn", customerName);
    localStorage.setItem("cph", customerPhone);
    localStorage.setItem("pn", productName);
    localStorage.setItem("favs", JSON.stringify(favoriteIds));
    localStorage.setItem("customTpls", JSON.stringify(customTemplates));
    localStorage.setItem("waHistory", JSON.stringify(history));
  }, [businessName, contactPerson, websiteLink, businessPhone, customerName, customerPhone, productName, favoriteIds, customTemplates, history]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory);
  
  let baseTemplates: Template[] = [];
  let categoryName = "";
  if (activeCategory === "favorites") {
    baseTemplates = [...CATEGORIES.flatMap((c) => c.templates), ...customTemplates].filter((t) => favoriteIds.includes(t.id));
    categoryName = "Favorites";
  } else if (activeCategory === "custom") {
    baseTemplates = customTemplates;
    categoryName = "My Templates";
  } else {
    baseTemplates = activeCategoryObj?.templates || [];
    categoryName = activeCategoryObj?.name || "";
  }
  
  const activeTemplates = baseTemplates.filter((tpl) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const l1 = tpl.en.toLowerCase();
    const l2 = tpl.ur.toLowerCase();
    return l1.includes(q) || l2.includes(q);
  });

  const getGreetingUrl = (lang: string) => {
    if (!mounted) return "";
    const hour = new Date().getHours();
    if (lang === 'en') {
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    } else {
      if (hour < 12) return "Subah Bakhair";
      if (hour < 18) return "Dopehar Bakhair";
      return "Shaam Bakhair";
    }
  };

  const injectVariables = (text: string) => {
    return text
      .replace(/\[Business Name\]/g, businessName || "[Business Name]")
      .replace(/\[Contact Person\]/g, contactPerson || "[Contact Person]")
      .replace(/\[Customer Name\]/g, customerName || "[Customer Name]")
      .replace(/\[Product Name\]/g, productName || "[Product Name]")
      .replace(/\[Greeting\]/g, getGreetingUrl(language))
      .replace(/\[Link\]/g, websiteLink || "[Link]");
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\[Business Name\]|\[Contact Person\]|\[Link\]|\[Customer Name\]|\[Product Name\]|\[Greeting\])/g);
    return parts.map((part, index) => {
      if (part === "[Business Name]") {
        return <span key={index} className="font-bold text-[#128C7E]">{businessName || "[Business Name]"}</span>;
      } else if (part === "[Contact Person]") {
        return <span key={index} className="font-bold text-[#128C7E]">{contactPerson || "[Contact Person]"}</span>;
      } else if (part === "[Customer Name]") {
        return <span key={index} className="font-bold text-[#128C7E]">{customerName || "[Customer Name]"}</span>;
      } else if (part === "[Product Name]") {
        return <span key={index} className="font-bold text-[#128C7E]">{productName || "[Product Name]"}</span>;
      } else if (part === "[Greeting]") {
        return <span key={index} className="font-bold text-[#128C7E]">{getGreetingUrl(language)}</span>;
      } else if (part === "[Link]") {
        return <span key={index} className="underline">{websiteLink || "[Link]"}</span>;
      }
      return part;
    });
  };

  const incrementStats = (type: 'copied' | 'sent') => {
    setStats((prev) => {
      const newStats = { ...prev, [type]: prev[type] + 1 };
      localStorage.setItem("usageStats", JSON.stringify(newStats));
      return newStats;
    });
  };

  const addToHistory = (text: string) => {
    setHistory(prev => {
      const newItems = [{ id: `hist-${Date.now()}`, text, timestamp: Date.now() }, ...prev];
      return newItems.slice(0, 50); // Keep last 50
    });
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      incrementStats('copied');
      addToHistory(text);
      if (selectedTemplate) setSelectedTemplate(null);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSendWa = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const phone = customerPhone.replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodedText}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    }
    incrementStats('sent');
    addToHistory(text);
    if (selectedTemplate) setSelectedTemplate(null);
  };

  const handleExport = () => {
    const data = { businessName, contactPerson, websiteLink, businessPhone, customTemplates, favoriteIds };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wa_templates_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      if (data.businessName !== undefined) setBusinessName(data.businessName);
      if (data.contactPerson !== undefined) setContactPerson(data.contactPerson);
      if (data.websiteLink !== undefined) setWebsiteLink(data.websiteLink);
      if (data.businessPhone !== undefined) setBusinessPhone(data.businessPhone);
      if (data.customTemplates) setCustomTemplates(data.customTemplates);
      if (data.favoriteIds) setFavoriteIds(data.favoriteIds);
      setShowExportImportModal(false);
      setImportText("");
    } catch(err) {
      alert("Invalid JSON format");
    }
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleDeleteCustom = (id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
    setFavoriteIds(prev => prev.filter(fid => fid !== id));
  };

  const handleAddCustomTemplate = () => {
    if (!newTplEn && !newTplUr) return;
    const newTpl: Template = {
      id: `custom-${Date.now()}`,
      en: newTplEn || newTplUr,
      ur: newTplUr || newTplEn,
    };
    setCustomTemplates(prev => [newTpl, ...prev]);
    setNewTplEn("");
    setNewTplUr("");
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#E5DDD5] font-sans overflow-hidden text-[#4A4A4A]">
      {/* Sidebar/Top Section for Variables */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-[#D1D7DB] flex flex-col shadow-xl z-20 shrink-0 h-auto md:h-screen">
        <div className="p-6 bg-[#075E54] text-white flex flex-col relative">
          <Link href="/" className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer" title="Back to Home">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-heading font-bold flex items-center gap-2 mt-2">
            <MessageCircle className="w-6 h-6 flex-shrink-0" fill="currentColor" />
            WA Template Gen
          </h1>
          <p className="text-xs opacity-80 mt-1 uppercase tracking-wider">Business Tool v1.2</p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Section 1: Customer Context */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-3">
              Customer Context
            </label>
            <div className="space-y-3">
              <div>
                <label htmlFor="customerName" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <User className="w-3 h-3" />
                  Customer Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="e.g. Sara"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3" />
                  Customer Phone <span className="opacity-70">(For Direct Send)</span>
                </label>
                <input
                  id="customerPhone"
                  type="text"
                  placeholder="e.g. 923001234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="productName" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Package className="w-3 h-3" />
                  Product / Service
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="e.g. Basic Plan"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Profile */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-3">
              Your Business Profile
            </label>
            <div className="space-y-3">
              <div>
                <label htmlFor="businessName" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3 h-3" />
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="contactPerson" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <UserCircle className="w-3 h-3" />
                  Contact Person
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  placeholder="e.g. Ali"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="businessPhone" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3" />
                  Business WA Number
                </label>
                <input
                  id="businessPhone"
                  type="text"
                  placeholder="For QR generation"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="websiteLink" className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
                  <LinkIcon className="w-3 h-3" />
                  Website / Link
                </label>
                <input
                  id="websiteLink"
                  type="text"
                  placeholder="e.g. www.example.com"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  className="w-full px-3 py-2 border border-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-[#128C7E] outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Section 3: Workflow Tools */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-3">
              Workflow Tools
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowExportImportModal(true)} 
                className="p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold hover:bg-gray-50 flex flex-col items-center gap-1.5 text-gray-600 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-[#128C7E]" /> Sync Config
              </button>
              <button 
                onClick={() => setShowQrModal(true)} 
                className="p-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold hover:bg-gray-50 flex flex-col items-center gap-1.5 text-gray-600 transition-colors shadow-sm"
              >
                <QrCode className="w-4 h-4 text-[#128C7E]" /> My WA QR
              </button>
              <div className="col-span-2 mt-1 p-2 border-2 border-[#DCF8C6] bg-[#DCF8C6]/30 rounded-lg flex items-center justify-between px-4 text-[#075E54]">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <BarChart3 className="w-4 h-4" /> Success Stats
                </div>
                <div className="text-xs font-semibold opacity-80">
                  {stats.sent} Sent • {stats.copied} Copied
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-2">
              App Settings
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
              <span className="text-sm font-medium flex items-center gap-2">
                <Languages className="w-4 h-4 text-gray-400" />
                Language
              </span>
              <div className="flex gap-1 bg-white p-1 rounded-md border text-[10px] font-bold">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 rounded transition-colors ${
                    language === "en" ? "bg-[#128C7E] text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("ur")}
                  className={`px-2 py-1 rounded transition-colors ${
                    language === "ur" ? "bg-[#128C7E] text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  UR/HI
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 text-[10px] text-center text-gray-400 border-t border-gray-50">
          Optimized for Core Web Vitals • v1.2
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-auto md:h-screen overflow-hidden">
        {/* Horizontal Category Navigation */}
        <header className="h-16 bg-[#F0F2F5] border-b border-[#D1D7DB] flex items-center px-4 md:px-8 gap-4 shrink-0 z-10 w-full overflow-hidden">
          <div className="flex-1 overflow-x-auto scrollbar-hide no-scrollbar whitespace-nowrap flex gap-4 h-full items-center">
            <button
              onClick={() => setActiveCategory("favorites")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeCategory === "favorites"
                  ? "bg-[#128C7E] text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              <Star className="w-4 h-4 fill-current" /> Favorites
            </button>
            <button
              onClick={() => setActiveCategory("custom")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeCategory === "custom"
                  ? "bg-[#128C7E] text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              <Plus className="w-4 h-4" /> My Templates
            </button>
              <button
              onClick={() => setActiveCategory("history")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeCategory === "history"
                  ? "bg-[#128C7E] text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              History
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#128C7E] text-white shadow-sm"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search bar pinned to right */}
          <div className="relative shrink-0 hidden md:flex items-center">
             <Search className="w-4 h-4 text-gray-400 absolute left-3" />
             <input 
               type="text"
               placeholder="Search templates..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full w-64 focus:ring-2 focus:ring-[#128C7E] outline-none"
             />
          </div>
        </header>

        {/* Mobile Search Bar (shows only on small screens) */}
        <div className="md:hidden bg-[#F0F2F5] p-4 border-b border-[#D1D7DB] relative shrink-0 z-10">
          <Search className="w-4 h-4 text-gray-400 absolute left-7 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-[#128C7E] outline-none"
          />
        </div>

        {/* Templates List */}
        <div 
          className="flex-1 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto bg-fixed content-start"
          style={{ backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 0)', backgroundSize: '24px 24px' }}
        >
          {activeCategory === "custom" && (
            <div 
              onClick={() => setShowAddModal(true)}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                <Plus className="w-6 h-6 text-[#128C7E]" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Create New Template</p>
            </div>
          )}
          {activeTemplates.length === 0 && activeCategory !== "custom" && activeCategory !== "history" && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400">
              <Search className="w-8 h-8 mb-4 opacity-50" />
              <p>No templates found for "{searchQuery}"</p>
            </div>
          )}
          {activeCategory === "history" && history.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400">
              <p>No recent history found.</p>
            </div>
          )}
          {activeCategory === "history" && history.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full min-h-[200px] hover:border-[#128C7E]/50 cursor-pointer transition-colors" onClick={() => {
                setSelectedTemplate(item);
                setDraftMessage(item.text);
              }}>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#DCF8C6] text-[#075E54] text-[10px] px-2 py-1 rounded font-bold uppercase">
                    History
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm leading-relaxed text-[#111B21] italic whitespace-pre-wrap">
                  "{item.text}"
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.text); }}
                  className="flex-1 bg-[#128C7E] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0f7569] transition-colors"
                >
                  {copiedId === item.id ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSendWa(item.text); }}
                  className="flex-1 border-2 border-[#128C7E] text-[#128C7E] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:text-white transition-colors"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          ))}
          {activeCategory !== "history" && activeTemplates.map((tpl, index) => {
            const rawText = language === "en" ? tpl.en : tpl.ur;
            const finalText = injectVariables(rawText);

            return (
              <div key={tpl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full min-h-[200px] hover:border-[#128C7E]/50 cursor-pointer transition-colors" onClick={() => {
                setSelectedTemplate(tpl);
                setDraftMessage(finalText);
              }}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-[#DCF8C6] text-[#075E54] text-[10px] px-2 py-1 rounded font-bold uppercase">
                      {categoryName}
                    </span>
                    <div className="flex items-center gap-3">
                       {activeCategory === "custom" && (
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteCustom(tpl.id); }} className="text-gray-400 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tpl.id); }} className={`${favoriteIds.includes(tpl.id) ? "text-yellow-500 fill-current" : "text-gray-300 hover:text-gray-400"} transition-colors`}>
                         <Star className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#111B21] italic">
                    "{renderHighlightedText(rawText)}"
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(tpl.id, finalText); }}
                    className="flex-1 bg-[#128C7E] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0f7569] transition-colors"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSendWa(finalText); }}
                    className="flex-1 border-2 border-[#128C7E] text-[#128C7E] py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:text-white transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Custom Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-[#F0F2F5]">
              <h3 className="font-heading font-bold text-gray-800">Add Custom Template</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">You can use variables: <br/><span className="text-[#128C7E] font-medium">[Business Name], [Contact Person], [Customer Name], [Product Name], [Link]</span>.</p>
              <div>
                <label className="text-sm font-semibold block mb-1">English Text</label>
                <textarea 
                  value={newTplEn} 
                  onChange={(e) => setNewTplEn(e.target.value)} 
                  placeholder="Enter English template..." 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#128C7E] outline-none h-28 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Roman Urdu / Hindi Text <span className="font-normal text-xs text-gray-400">(Optional)</span></label>
                <textarea 
                  value={newTplUr} 
                  onChange={(e) => setNewTplUr(e.target.value)} 
                  placeholder="Enter translated template..." 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#128C7E] outline-none h-28 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={handleAddCustomTemplate} className="px-4 py-2 font-medium bg-[#128C7E] text-white hover:bg-[#0f7569] rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50" disabled={!newTplEn && !newTplUr}>Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Sync / Export Import Modal */}
      {showExportImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-[#F0F2F5]">
              <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2"><Upload className="w-4 h-4 text-[#128C7E]"/> Sync Configuration</h3>
              <button onClick={() => setShowExportImportModal(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#DCF8C6]/30 border-2 border-[#DCF8C6] p-4 rounded-xl">
                <h4 className="text-sm font-heading font-bold text-[#075E54] mb-2">Export Data for your Team</h4>
                <p className="text-xs text-gray-600 mb-3">Download a backup of your Business Profile, custom templates, and favorites. Share this JSON file with your team for consistent replies.</p>
                <button onClick={handleExport} className="w-full bg-[#128C7E] text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-[#0f7569] shadow-sm transition-colors">
                  <Download className="w-4 h-4" /> Export Team Config
                </button>
              </div>

              <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                <h4 className="text-sm font-heading font-bold text-gray-800 mb-2">Import Data</h4>
                <p className="text-xs text-gray-600 mb-2">Paste the JSON configuration below to load team settings and overwrite your current setup.</p>
                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-24 p-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#128C7E] outline-none"
                  placeholder='{"businessName": "Acme", ... }'
                />
                <button onClick={handleImport} className="w-full mt-3 bg-white border border-gray-300 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-gray-100 shadow-sm transition-colors text-gray-700">
                  <Upload className="w-4 h-4" /> Import Team Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-[#F0F2F5]">
              <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2"><QrCode className="w-4 h-4 text-[#128C7E]"/> Your Business QR Code</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center">
              {businessPhone ? (
                <>
                  <div className="p-2 border-4 border-[#128C7E] rounded-2xl mb-4 bg-white relative">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/${businessPhone.replace(/\D/g, '')}`} 
                      alt="WhatsApp QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-center mb-1">{businessName || "Your Business"}</h4>
                  <p className="text-sm text-gray-500 mb-6 text-center">Scan to chat with us on WhatsApp</p>
                  
                  <div className="w-full space-y-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://wa.me/${businessPhone.replace(/\D/g, '')}`)}
                      className="w-full bg-[#128C7E] text-white py-2 rounded-md font-bold text-sm flex justify-center items-center gap-2 shadow-sm transition-colors hover:bg-[#0f7569]"
                    >
                      <Copy className="w-4 h-4" /> Copy Direct Link
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Please enter your Business WA Number in the profile section to generate a QR code.</p>
                  <button 
                    onClick={() => {
                        setShowQrModal(false);
                        document.getElementById('businessPhone')?.focus();
                    }}
                    className="mt-4 px-4 py-2 bg-[#128C7E] text-white rounded-md text-sm font-bold"
                  >
                    Setup Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for Draft and Quick Replies */}
      {selectedTemplate !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 border-b flex justify-between items-center bg-[#F0F2F5]">
              <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#128C7E]" /> Preview & Edit
              </h3>
              <button onClick={() => setSelectedTemplate(null)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-6 flex-1 bg-[#E5DDD5]" style={{ backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 0)', backgroundSize: '16px 16px' }}>
              {/* WhatsApp Bubble Preview */}
              <div className="flex justify-end">
                 <div className="bg-[#DCF8C6] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] relative whitespace-pre-wrap text-[#111B21] text-sm">
                   {draftMessage}
                   <div className="text-[10px] text-gray-500 text-right mt-1">Right now</div>
                 </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-2">
                  Add Quick Reply
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES[activeCategory === 'favorites' || activeCategory === 'custom' || activeCategory === 'history' ? 'custom' : activeCategory]?.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => setDraftMessage(prev => prev + " " + reply)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="text-[10px] uppercase font-bold text-[#128C7E] tracking-widest block mb-2">
                  Edit Draft
                </label>
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] outline-none h-32 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => handleCopy(selectedTemplate.id, draftMessage)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {copiedId === selectedTemplate.id ? <><Check className="w-4 h-4 text-[#128C7E] " /> Copied</> : <><Copy className="w-4 h-4" /> Copy Draft</>}
              </button>
              <button
                onClick={() => handleSendWa(draftMessage)}
                className="flex-1 bg-[#128C7E] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0f7569] shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" /> Send Direct
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for hiding scrollbars but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
