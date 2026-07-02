import { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | Customer Support & Depot HQ | Infinity Traders',
  description: 'Contact Infinity Traders in Dhanbad for questions about shipping times, product authenticity, exchange policies, or Cash on Delivery (COD) serviceability. Authorized multi-brand supplier.',
  keywords: 'contact Infinity Traders, customer care, Dhanbad footwear office, exchange shoe size, COD service India, authenticity guarantee',
  alternates: {
    canonical: 'https://infinitytraders.shop/contact',
  },
};

export default function ContactPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Are the shoes and apparel authentic?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, Infinity Traders distributes only 100% authentic products. We source all footwear, activewear, and slides directly from official brand suppliers including Nike, Adidas, Puma, and Skechers.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What are your shipping rates and charges?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We charge shipping rates between ₹150 and ₹500 depending upon the destination pincode.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How long does it take for my order to arrive?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Standard delivery time is 4 to 5 days across India.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is your return policy?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "We strictly enforce a 'No Return, Only Exchange' policy. If you need to exchange an item for a different size or due to a manufacturing defect, you must submit an exchange request within 24 hours of delivery. The item must be unworn and in its original packaging."
        }
      },
      {
        '@type': 'Question',
        'name': 'Is Cash on Delivery (COD) available?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, Cash on Delivery is fully supported for all serviceable pincodes. You can check pincode serviceability before checking out.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ContactClient />
    </>
  );
}
