import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Briefcase, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CareerGuidanceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { 
          messages: [
            {
              role: "system",
              content: "You are an experienced career counselor and guidance expert. Help students with:\n1. Career path exploration and recommendations\n2. Industry insights and job market trends\n3. Skill development and course suggestions\n4. Resume building and interview preparation\n5. Internship and job search strategies\n6. Higher education options and guidance\n\nProvide personalized advice based on student interests, strengths, and goals. Be encouraging and practical."
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        },
      });

      if (error) {
        if (error.message?.includes("Rate limit")) {
          toast({
            title: "Rate limit reached",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes("credits exhausted")) {
          toast({
            title: "AI credits exhausted",
            description: "Please contact your administrator.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      let assistantMessage = "";
      const reader = data.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === "assistant") {
                      return [...prev.slice(0, -1), { role: "assistant", content: assistantMessage }];
                    }
                    return [...prev, { role: "assistant", content: assistantMessage }];
                  });
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
        }
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    await streamChat(userMessage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-secondary rounded-full p-2">
              <Briefcase className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Career Guidance Counselor</h1>
              <p className="text-sm text-muted-foreground">Plan your career path with expert advice</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-220px)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <p className="text-lg font-medium">Career Guidance Counselor</p>
                <p className="mt-2">Ask about career paths, job opportunities, or skill development!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <p className="text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your career..."
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CareerGuidanceChat;
