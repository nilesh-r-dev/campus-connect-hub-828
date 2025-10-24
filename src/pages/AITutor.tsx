import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = { role: "user" | "assistant"; content: string };

const AITutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { messages: [...messages, { role: "user", content: userMessage }] }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({ title: "Error", description: "Rate limit exceeded. Please try again later.", variant: "destructive" });
          return;
        }
        if (error.message.includes('402')) {
          toast({ title: "Error", description: "AI credits exhausted. Please contact admin.", variant: "destructive" });
          return;
        }
        throw error;
      }

      // Handle streaming response
      if (data?.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    await streamChat(userMessage);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">AI Tutor</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-180px)] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Your AI Study Assistant
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask about exam preparation, career guidance, or previous year questions
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground text-sm">
                    Ask me about exam tips, important questions, or career advice!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="bg-primary/10 rounded-full p-2 h-fit">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="bg-secondary/10 rounded-full p-2 h-fit">
                        <User className="h-4 w-4 text-secondary" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AITutor;