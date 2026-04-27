import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Book, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { submitSupportMessageApi } from '../../services/supportService';

const faqs = [
  {
    question: 'How do I connect with investors?',
    answer:
      'You can browse the investor directory and send collaboration requests. Once accepted, you can message them directly.'
  },
  {
    question: 'What should I include in my startup profile?',
    answer:
      'Add your pitch, funding needs, team information, market opportunity, traction and startup history.'
  },
  {
    question: 'How do I share documents securely?',
    answer:
      'Upload documents in the Documents section and manage their status from your secure document area.'
  },
  {
    question: 'What are collaboration requests?',
    answer:
      'Collaboration requests are formal interest requests between investors and entrepreneurs.'
  }
];

export const HelpPage: React.FC = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Name, email and message are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitSupportMessageApi(form);
      toast.success(response.message);
      setForm((prev) => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit support message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      <div className="max-w-2xl">
        <Input
          placeholder="Search help articles..."
          startAdornment={<Search size={18} />}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Book size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Documentation</h2>
            <p className="text-sm text-gray-600 mt-2">
              Browse platform guides and common workflows
            </p>
            <Button variant="outline" className="mt-4" rightIcon={<ExternalLink size={16} />}>
              View Docs
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <MessageCircle size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Messages</h2>
            <p className="text-sm text-gray-600 mt-2">
              Use platform messages to contact your network
            </p>
            <Button className="mt-4">Open Messages</Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Phone size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Contact Us</h2>
            <p className="text-sm text-gray-600 mt-2">
              Submit a support request using the form below
            </p>
            <Button variant="outline" className="mt-4" leftIcon={<Mail size={16} />}>
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Still need help?</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your name"
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="your@email.com"
              />
            </div>

            <Input
              label="Subject"
              value={form.subject}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subject: event.target.value }))
              }
              placeholder="Support request subject"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="How can we help you?"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
