import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { whatsappApi } from '@/api';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, send to support endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Support request submitted successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'How do I add my daily health metrics?',
      answer: 'Go to Dashboard and click "Add Metric" button. Select the metric type (steps, heart rate, sleep, or calories), enter the value, and save. You can also sync data from external sources like Google Fit or Apple Health.'
    },
    {
      question: 'Can I receive health reports on WhatsApp?',
      answer: 'Yes! Go to your profile, enter your WhatsApp number, and enable WhatsApp notifications. You&apos;ll receive personalized health reports and insights directly to your WhatsApp.'
    },
    {
      question: 'How does the AI Health Coach work?',
      answer: 'Our AI Health Coach uses advanced AI (Gemini Flash) to provide personalized health advice. Simply chat with it about fitness, nutrition, sleep, or any health concerns, and get instant expert guidance.'
    },
    {
      question: 'What payment methods are supported in the store?',
      answer: 'We support all major payment methods through Razorpay including UPI, Credit Cards, Debit Cards, and Net Banking. All transactions are secure and encrypted.'
    },
    {
      question: 'How is my health data protected?',
      answer: 'We take your privacy seriously. All health data is encrypted and stored securely. We never share your personal health information with third parties without your explicit consent.'
    },
    {
      question: 'Can I export my health data?',
      answer: 'Yes, you can export your health metrics data from the Health Analysis page. We provide options to download your data in various formats for your records.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            Support & Help
          </h1>
          <p className="text-base text-[#666] mt-2">We&apos;re here to help you on your health journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-[#E5E7E1] rounded-2xl text-center hover:shadow-md transition-all duration-200">
            <MessageCircle className="w-12 h-12 text-[#8A9A5B] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1A1F16] mb-2">Live Chat</h3>
            <p className="text-sm text-[#666] mb-4">Chat with our AI assistant</p>
            <Button
              onClick={() => window.location.href = '/ai-coach'}
              className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white"
            >
              Start Chat
            </Button>
          </Card>

          <Card className="p-6 border-[#E5E7E1] rounded-2xl text-center hover:shadow-md transition-all duration-200">
            <Mail className="w-12 h-12 text-[#8A9A5B] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1A1F16] mb-2">Email Support</h3>
            <p className="text-sm text-[#666] mb-4">support@medigraph.com</p>
            <Button
              onClick={() => window.location.href = 'mailto:support@medigraph.com'}
              variant="outline"
              className="rounded-full border-[#E5E7E1]"
            >
              Send Email
            </Button>
          </Card>

          <Card className="p-6 border-[#E5E7E1] rounded-2xl text-center hover:shadow-md transition-all duration-200">
            <Phone className="w-12 h-12 text-[#8A9A5B] mx-auto mb-4" />
            <h3 className="font-semibold text-[#1A1F16] mb-2">Phone Support</h3>
            <p className="text-sm text-[#666] mb-4">+91 1800-123-4567</p>
            <Button
              onClick={() => window.location.href = 'tel:+911800123456'}
              variant="outline"
              className="rounded-full border-[#E5E7E1]"
            >
              Call Now
            </Button>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 border-[#E5E7E1] rounded-3xl">
          <h2 className="text-2xl font-outfit font-semibold text-[#1A1F16] mb-6">
            Send us a message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="rounded-xl border-[#E5E7E1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1F16] mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="rounded-xl border-[#E5E7E1]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What's this about?"
                required
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1F16] mb-2">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us more about your question or concern..."
                required
                rows={6}
                className="rounded-xl border-[#E5E7E1]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white px-8 h-12 transition-all duration-200 hover:-translate-y-0.5"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Card>

        {/* FAQ Section */}
        <div>
          <h2 className="text-3xl font-outfit font-semibold text-[#1A1F16] mb-6 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-[#8A9A5B]" />
            Frequently Asked Questions
          </h2>
          <Card className="border-[#E5E7E1] rounded-3xl p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={`faq-${faq.question.substring(0, 20)}`} value={`item-${index}`} className="border-b border-[#E5E7E1] last:border-0">
                  <AccordionTrigger className="text-left font-medium text-[#1A1F16] hover:text-[#8A9A5B] transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#666] leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;