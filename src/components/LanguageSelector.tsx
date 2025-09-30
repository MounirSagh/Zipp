import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

const languages = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    direction: "ltr",
  },
  {
    code: "ar",
    name: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
  },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    const language = languages.find((lang) => lang.code === langCode);
    if (language) {
      i18n.changeLanguage(langCode);
      document.documentElement.dir = language.direction;
      document.documentElement.lang = langCode;
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Set initial direction and language
    const language =
      languages.find((lang) => lang.code === i18n.language) || languages[0];
    document.documentElement.dir = language.direction;
    document.documentElement.lang = language.code;
  }, [i18n.language]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-neutral-800 border-yellow-300/20 text-white hover:bg-neutral-700 transition-all duration-200 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm min-h-[40px] shadow-lg"
        >
          <Languages className="w-8 h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-sm bg-neutral-900 border-yellow-500/30 text-white rounded-2xl shadow-2xl backdrop-blur-lg">
        <DialogHeader className="pb-4 border-b border-yellow-500/20">
          <DialogTitle className="text-xl text-center text-white bg-clip-text  font-bold">
            Choose Language
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 p-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full justify-start p-4 rounded-xl transition-all duration-300 font-medium text-left ${
                currentLanguage.code === language.code
                  ? "text-white shadow-lg shadow-yellow-500/30 transform scale-105 border border-yellow-300/20"
                  : "bg-neutral-800/50 hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-yellow-600/20 text-neutral-300 hover:text-white border border-slate-700/50 hover:border-yellow-500/30"
              }`}
              variant="ghost"
            >
              <span className="text-2xl rtl:ml-3 ltr:mr-3">
                {language.flag}
              </span>
              <span className="flex-1">{language.name}</span>
              {currentLanguage.code === language.code && (
                <span className="text-yellow-200 text-sm">✓</span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
