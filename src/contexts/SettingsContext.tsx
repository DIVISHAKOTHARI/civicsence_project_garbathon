import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'hi' | 'gu';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'CivicSense',
    tagline: 'Your intelligent partner for a better city.',
    howCanHelp: 'How can I help you today?',
    uploadPhoto: 'Upload a photo of any municipal issue like potholes or garbage piles, and I\'ll handle the rest.',
    placeholder: 'Describe the issue or ask about status...',
    voiceInput: 'Voice Input',
    stopListening: 'Stop Listening',
    newReport: 'New Report',
    myComplaints: 'My Complaints',
    signOut: 'Sign Out',
    analyzing: 'Our AI agent is analyzing the scene...',
    identified: 'I\'ve identified a **{issueType}** in **{ward}**.',
    filing: 'Filing this with the **{department}** department.',
    trackingId: 'Your Tracking ID is: **{trackingId}**',
    latestStatus: 'Status for your latest complaint (**{trackingId}**): **{status}**.',
    handledBy: 'It is being handled by the **{department}** department.',
    noComplaints: 'You don\'t have any active complaints to track.',
    specifyLocation: 'Specify location (Area name)...',
    continueGoogle: 'Continue with Google',
    signIn: 'Sign In',
    emailLabel: 'Email Address',
    demoMode: 'Demo mode: This app uses local storage and does not connect to actual municipal services.',
    reportPothole: 'Report a large pothole',
    garbageCollection: 'Garbage collection needed',
    streetLight: 'Broken street light in my area',
    waterLogging: 'Water logging after rain',
    statusByWard: 'Solved by nearest ward: {ward}'
  },
  hi: {
    appName: 'सिविकसेंस (CivicSense)',
    tagline: 'एक बेहतर शहर के लिए आपका बुद्धिमान साथी।',
    howCanHelp: 'मैं आज आपकी क्या मदद कर सकता हूँ?',
    uploadPhoto: 'गड्ढों या कचरे के ढेर जैसे किसी भी नगरपालिका मुद्दे की फोटो अपलोड करें, और मैं बाकी काम संभाल लूँगा।',
    placeholder: 'मुद्दे का वर्णन करें या स्थिति के बारे में पूछें...',
    voiceInput: 'आवाज इनपुट',
    stopListening: 'सुनना बंद करें',
    newReport: 'नई रिपोर्ट',
    myComplaints: 'मेरी शिकायतें',
    signOut: 'साइन आउट',
    analyzing: 'हमारा एआई एजेंट दृश्य का विश्लेषण कर रहा है...',
    identified: 'मैंने **{ward}** में **{issueType}** की पहचान की है।',
    filing: 'इसे **{department}** विभाग के साथ दर्ज किया जा रहा है।',
    trackingId: 'आपका ट्रैकिंग आईडी है: **{trackingId}**',
    latestStatus: 'आपकी नवीनतम शिकायत (**{trackingId}**) की स्थिति: **{status}**।',
    handledBy: 'इसे **{department}** विभाग द्वारा संभाला जा रहा है।',
    noComplaints: 'आपके पास ट्रैक करने के लिए कोई सक्रिय शिकायत नहीं है।',
    specifyLocation: 'स्थान निर्दिष्ट करें (क्षेत्र का नाम)...',
    continueGoogle: 'गूगल के साथ जारी रखें',
    signIn: 'साइन इन करें',
    emailLabel: 'ईमेल पता',
    demoMode: 'डेमो मोड: यह ऐप स्थानीय भंडारण का उपयोग करता है और वास्तविक नगरपालिका सेवाओं से नहीं जुड़ता है।',
    reportPothole: 'एक बड़े गड्ढे की रिपोर्ट करें',
    garbageCollection: 'कचरा संग्रह की आवश्यकता है',
    streetLight: 'मेरे क्षेत्र में टूटी हुई स्ट्रीट लाइट',
    waterLogging: 'बारिश के बाद जलभराव',
    statusByWard: 'निकटतम वार्ड द्वारा हल किया गया: {ward}'
  },
  gu: {
    appName: 'સિવિકસેન્સ (CivicSense)',
    tagline: 'વધુ સારા શહેર માટે તમારો બુદ્ધિશાળી સાથી.',
    howCanHelp: 'આજે હું તમને કેવી રીતે મદદ કરી શકું?',
    uploadPhoto: 'ખાડાઓ અથવા કચરાના ઢગલા જેવી કોઈપણ મ્યુનિસિપલ સમસ્યાનો ફોટો અપલોડ કરો, અને હું બાકીનું સંભાળી લઈશ.',
    placeholder: 'સમસ્યાનું વર્ણન કરો અથવા સ્થિતિ વિશે પૂછો...',
    voiceInput: 'વોઇસ ઇનપુટ',
    stopListening: 'સાંભળવાનું બંધ કરો',
    newReport: 'નવો રિપોર્ટ',
    myComplaints: 'મારી ફરિયાદો',
    signOut: 'સાઇન આઉટ',
    analyzing: 'અમારો AI એજન્ટ દ્રશ્યનું વિશ્લેષણ કરી રહ્યો છે...',
    identified: 'મેં **{ward}** માં **{issueType}** ઓળખી કાઢી છે.',
    filing: 'આને **{department}** વિભાગમાં ફાઇલ કરવામાં આવી રહી છે.',
    trackingId: 'તમારો ટ્રેકિંગ ID છે: **{trackingId}**',
    latestStatus: 'તમારી નવીનતમ ફરિયાદ (**{trackingId}**) ની સ્થિતિ: **{status}**.',
    handledBy: 'તે **{department}** વિભાગ દ્વારા હેન્ડલ કરવામાં આવે છે.',
    noComplaints: 'તમારી પાસે ટ્રેક કરવા માટે કોઈ સક્રિય ફરિયાદો નથી.',
    specifyLocation: 'સ્થાન સ્પષ્ટ કરો (વિસ્તારનું નામ)...',
    continueGoogle: 'Google સાથે ચાલુ રાખો',
    signIn: 'સાઇન ઇન કરો',
    emailLabel: 'ઈમેલ સરનામું',
    demoMode: 'ડેમો મોડ: આ એપ્લિકેશન લોકલ સ્ટોરેજનો ઉપયોગ કરે છે અને વાસ્તવિક મ્યુનિસિપલ સેવાઓ સાથે જોડતી નથી.',
    reportPothole: 'મોટા ખાડાની જાણ કરો',
    garbageCollection: 'કચરો ઉપાડવાની જરૂર છે',
    streetLight: 'મારા વિસ્તારમાં તૂટેલી સ્ટ્રીટ લાઈટ',
    waterLogging: 'વરસાદ પછી પાણી ભરાવું',
    statusByWard: 'નજીકના વોર્ડ દ્વારા ઉકેલવામાં આવ્યો: {ward}'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string) => translations[language][key] || key;

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
