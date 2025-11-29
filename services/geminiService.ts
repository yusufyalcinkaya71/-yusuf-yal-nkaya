import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Task, PlannerResult } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const BASE_MODEL = 'gemini-2.5-flash';

// --- Chat Service ---

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  try {
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
      model: BASE_MODEL,
      history: chatHistory,
      config: {
        systemInstruction: `Sen 'TURAN' adında yardımsever, kibar ve verimli bir yapay zeka asistanısın. Türkçe konuşuyorsun. 
        
        GÖREVLERİN:
        1. Kullanıcının günlük işlerini organize etmesine, sorularını yanıtlamasına ve üretken olmasına yardımcı ol.
        2. KVKK (Kişisel Verilerin Korunması Kanunu) prensiplerine sıkı sıkıya bağlı kal. Kullanıcıdan asla kredi kartı bilgisi, T.C. Kimlik Numarası, şifreler veya özel sağlık verileri gibi hassas kişisel bilgiler talep etme. Kullanıcı bu bilgileri verirse, bu tür hassas verileri paylaşmaması gerektiğini nazikçe hatırlat.
        3. Tıbbi, hukuki veya finansal yatırım tavsiyesi verme. Bu konularda sadece genel bilgiler ver ve bir uzmana danışılmasını öner.
        
        YETENEKLERİN:
        - Kullanıcının "hava durumu", "güncel haberler" veya belirli bir terimin anlamı gibi gerçek zamanlı bilgi gerektiren sorularını Google Arama aracını kullanarak yanıtla.
        - Kullanıcının verdiği metinleri özetleyebilir, analiz edebilirsin.
        
        ÜSLUP VE FORMAT:
        - Cevapların kısa, net ve teşvik edici olsun.
        - Samimi ve modern bir dil kullan. Duyguyu aktarmak için metin içinde uygun emojileri (🎉, 👍, 🤔, ✨ vb.) kullanabilirsin ("Emoji özelliği").
        - ÖNEMLİ: Her mesajının sonuna imza olarak şu Türk devletleri bayraklarından (🇹🇷, 🇦🇿, 🇰🇿, 🇰🇬, 🇹🇲, 🇺🇿, 🇨🇾) SADECE BİR TANESİNİ rastgele seçerek ekle. Her cevabında farklı bir bayrak kullanmaya çalış. Bütün bayrakları aynı anda sıralama, sadece 1 tane seç.
        `,
        tools: [{ googleSearch: {} }],
      }
    });

    const result = await chat.sendMessage({ message });
    
    // Extract sources if available
    const sources: { title: string; uri: string }[] = [];
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      result.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
         if (chunk.web) {
           sources.push({ 
             title: chunk.web.title || 'Kaynak', 
             uri: chunk.web.uri 
           });
         }
      });
    }

    return { 
      text: result.text || "Üzgünüm, şu an cevap veremiyorum.",
      sources
    };
  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Mesaj gönderilirken bir hata oluştu.");
  }
};

// --- Task Breakdown Service ---

export const breakDownTask = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: `Şu görevi gerçekleştirmek için 3 ile 5 arasında mantıklı, küçük adıma (alt göreve) böl: "${taskTitle}". Sadece adımları JSON array olarak döndür.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Task Breakdown Error:", error);
    return ["Adımları belirle", "İşe başla", "Tamamla"]; // Fallback
  }
};

// --- Daily Planner Service ---

export const generateDailyPlan = async (notes: string): Promise<PlannerResult> => {
  try {
    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: `Aşağıdaki notlara ve yapılacaklara dayanarak verimli bir günlük program oluştur. Ayrıca gün için 2-3 motivasyon veya verimlilik ipucu ekle.\n\nKullanıcı Notları:\n${notes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Saat (Örn: 09:00 - 10:00)" },
                  activity: { type: Type.STRING, description: "Aktivite başlığı" },
                  description: { type: Type.STRING, description: "Kısa açıklama" }
                },
                required: ["time", "activity"]
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["schedule", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Plan oluşturulamadı");
    return JSON.parse(text) as PlannerResult;
  } catch (error) {
    console.error("Planner Error:", error);
    throw new Error("Plan oluşturulurken bir hata meydana geldi.");
  }
};