import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '@/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AI_COACH } from '@/constants/testIds';
import { Bot, Send, User } from 'lucide-react';
import { toast } from 'sonner';

const AICoach = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI health coach. How can I help you today? Feel free to ask me about fitness, nutrition, sleep, or any health-related questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.chat(input, sessionId);
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            assistantMessage += data;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = assistantMessage;
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      toast.error('Failed to get response from AI coach');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#8A9A5B] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            AI Health Coach
          </h1>
          <p className="text-base text-[#666] mt-2">Your personal health assistant powered by AI</p>
        </div>

        <Card className="border-[#E5E7E1] rounded-3xl h-[600px] flex flex-col" data-testid={AI_COACH.chatContainer}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid={AI_COACH.messageList}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-[#E2725B]' : 'bg-[#8A9A5B]'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#E2725B] text-white'
                      : 'bg-[#F4F5F0] text-[#1A1F16]'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-[#E5E7E1]">
            <div className="flex gap-3">
              <Input
                data-testid={AI_COACH.messageInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your health..."
                disabled={loading}
                className="flex-1 rounded-xl border-[#E5E7E1]"
              />
              <Button
                data-testid={AI_COACH.sendBtn}
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white w-12 h-12 p-0 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AICoach;