'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { sendContactQueryAction } from '@/app/actions';

export default function ContactClient() {
  const { t } = useLanguage();
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FAQ Accordion State & Questions
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    {
      question: "Are the shoes and apparel authentic?",
      answer: "Yes, Infinity Traders distributes only 100% authentic products. We source all footwear, activewear, and slides directly from official brand suppliers including Nike, Adidas, Puma, and Skechers."
    },
    {
      question: "What are your shipping rates and charges?",
      answer: "We charge shipping rates between ₹150 and ₹500 depending upon the destination pincode."
    },
    {
      question: "How long does it take for my order to arrive?",
      answer: "Standard delivery time is 4 to 5 days across India."
    },
    {
      question: "What is your return policy?",
      answer: "We strictly enforce a 'No Return' policy on all purchased products. All sales are final and items are non-returnable. Please verify your sizes and choices carefully before purchasing."
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes, Cash on Delivery is fully supported for all serviceable pincodes. You can check pincode serviceability before checking out."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendContactQueryAction(name, email, subject, message);
      if (res.success) {
        setIsSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMsg(res.error || 'Failed to send query.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#f4f3ef] min-h-[80vh] flex flex-col justify-center"
    >
      {/* Page Header */}
      <div className="text-center space-y-2 border-b border-black/5 pb-8 mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-black/55 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'संपर्क करें' : 'Get In Touch'}</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-black uppercase">
          {t('nav.contact')}
        </h1>
        <p className="text-xs text-black/60 font-light max-w-md mx-auto leading-relaxed">
          {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'शिपिंग गति, कस्टम आकार या थोक वितरण के बारे में प्रश्न हैं? आज ही हमारे धनबाद सहायता डेस्क से बात करें।' : 'Have questions about shipping speed, custom sizing, or bulk distributions? Speak with our Dhanbad support desk today.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Cards & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Main Support Channels */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'वितरण डेस्क' : 'Distribution Desk'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black/5 rounded-full text-black flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[9px] uppercase tracking-wider text-black/40 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ईमेल संचार' : 'Email Communication'}</h3>
                  <a href="mailto:support@infinitytraders.shop" className="text-xs font-bold text-black hover:underline block mt-0.5">
                    support@infinitytraders.shop
                  </a>
                  <p className="text-[10px] text-black/50 font-light mt-0.5">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'औसत प्रतिक्रिया ३ घंटे के भीतर।' : 'Average response within 3 hours.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-black/5 pt-4">
                <div className="p-3 bg-black/5 rounded-full text-black flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[9px] uppercase tracking-wider text-black/40 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'हेल्पलाइन और व्हाट्सएप' : 'Helpline & WhatsApp'}</h3>
                  <a href="tel:+916202106616" className="text-xs font-bold text-black hover:underline block mt-0.5">
                    +91 62021 06616
                  </a>
                  <p className="text-[10px] text-black/50 font-light mt-0.5">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'सोम - शनि: सुबह ११:०० से रात ८:३० बजे तक' : 'Mon - Sat: 11:00 AM to 8:30 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: HQ Location */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-3">
              {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'लॉजिस्टिक्स डिपो और मुख्यालय' : 'Logistics Depot & HQ'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black/5 rounded-full text-black flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[9px] uppercase tracking-wider text-black/40 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'पता रजिस्ट्री' : 'Address Registry'}</h3>
                  <p className="text-xs font-bold text-black leading-relaxed mt-0.5">
                    Infinity Traders,<br />
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'पुतकी चिरूडीह, नवनीत होटल के सामने,' : 'Putki Chirudih, opposite Navneet Hotel,'}<br />
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'धनबाद, झारखंड' : 'Dhanbad, Jharkhand'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-black/5 pt-4">
                <div className="p-3 bg-black/5 rounded-full text-black flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[9px] uppercase tracking-wider text-black/40 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'डिपो का समय' : 'Depot Hours'}</h3>
                  <p className="text-xs font-bold text-black mt-0.5">
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'रविवार और छुट्टियाँ: प्रेषण के लिए बंद' : 'Sundays & Holidays: Closed for Dispatch'}
                  </p>
                  <p className="text-[10px] text-black/50 font-light mt-0.5">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'चालान २४/७ ऑनलाइन उत्पन्न होते हैं।' : 'Invoices generated 24/7 online.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7 bg-white border border-black/5 p-8 rounded-2xl shadow-xs">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-black/5 pb-4 mb-6">
            {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'एक डिजिटल पूछताछ भेजें' : 'Dispatch a Digital Inquiry'}
          </h2>

          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-black text-white">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'पूछताछ दर्ज की गई' : 'Inquiry Logged'}</h3>
                <p className="text-xs text-black/60 font-light max-w-xs mx-auto">
                  {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'आपका संदेश सुरक्षित रूप से भेज दिया गया है। एक प्रतिनिधि जल्द ही आपसे संपर्क करेगा।' : 'Your communication has been securely transmitted. A representative will contact you via email shortly.'}
                </p>
              </div>
              <button
                onClick={() => setIsSuccess(false)}
                className="bg-black hover:bg-transparent text-white hover:text-black border border-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all mt-4"
              >
                {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'दूसरा संदेश भेजें' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-500/5 border border-red-500/10 text-red-800 text-xs p-4 rounded-xl flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'पूरा नाम' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'नाम दर्ज करें' : 'Enter name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ईमेल पता' : 'Email Address'}</label>
                  <input
                    type="email"
                    required
                    placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'ईमेल दर्ज करें' : 'Enter email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'विषय रुचि' : 'Subject Interest'}</label>
                <input
                  type="text"
                  required
                  placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'जैसे: थोक पूछताछ, शिपिंग में देरी' : 'e.g. Bulk inquiry, Shipping transit delay'}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-full px-4 py-2.5 text-xs outline-none bg-[#fdfdfd] transition-all text-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'संदेश विवरण' : 'Message Details'}</label>
                <textarea
                  rows={4}
                  required
                  placeholder={t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'अपनी पूछताछ यहाँ लिखें...' : 'Write your query here...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-black/10 focus:border-black rounded-2xl px-4 py-3 text-xs outline-none bg-[#fdfdfd] transition-all text-black resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-transparent text-white hover:text-black border border-black py-3.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'भेजा जा रहा है...' : 'Senders processing...'}
                  </>
                ) : (
                  <>
                    {t('home.newArrivals') === 'नए जूते (New Arrivals)' ? 'पूछताछ भेजें' : 'Send Inquiry'} <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="mt-24 border-t border-black/5 pt-20 max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-black/40 font-extrabold block">Have a Question?</span>
          <h2 className="text-3xl font-extrabold tracking-widest text-black uppercase">
            Frequently Asked
          </h2>
          <div className="w-12 h-1 bg-black mx-auto mt-3 rounded-full" />
        </div>

        <div className="divide-y divide-black/10 border-t border-b border-black/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="group py-5 transition-colors duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none select-none"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-black group-hover:translate-x-1.5 transition-transform duration-300">
                    {faq.question}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/5 group-hover:bg-black group-hover:text-white transition-all duration-300 shrink-0 ml-4`}>
                    <svg 
                      className={`w-3.5 h-3.5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
                <div 
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-xs text-black/60 font-medium leading-relaxed pl-1 pb-4 max-w-3xl">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
