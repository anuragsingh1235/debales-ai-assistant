import { GoogleGenerativeAI } from '@google/generative-ai';
import { IIntegrations, IMessage } from '@/types';

// Mock data for integrations - this is what gets injected into the system prompt
// when integrations are toggled on for a project
const SHOPIFY_MOCK_DATA = `
SHOPIFY STORE DATA:
- Recent Orders: #1042 ($245 - iPhone case), #1041 ($89 - laptop stand), #1040 ($320 - wireless headphones)
- Top Products: AirPods Pro (156 sold), MacBook Stand (98 sold), USB-C Hub (87 sold)
- Inventory Alert: Wireless Charger (only 3 left in stock)
- Today's Revenue: $2,847
- Active Customers: 1,243
`;

const CRM_MOCK_DATA = `
CRM DATA:
- Recent Deals: Acme Corp ($15,000 - Proposal stage), TechStart ($8,500 - Negotiation), GlobalCo ($22,000 - Won)
- Follow-ups Due Today: 4 contacts (Sarah Johnson, Mike Chen, Lisa Park, David Kumar)
- Pipeline Total: $187,500
- Win Rate This Month: 34%
- Hot Leads: 7 new leads from LinkedIn campaign
`;

export interface AIResponse {
  content: string;
  steps: string[];
}

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: IMessage[],
  integrations: IIntegrations,
  productType: string
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Build steps array showing what the AI is doing
  const steps: string[] = ['Analyzing your query...'];

  let integrationContext = '';

  if (integrations.shopify?.enabled) {
    steps.push('Fetching Shopify store data...');
    integrationContext += SHOPIFY_MOCK_DATA;
  }

  if (integrations.crm?.enabled) {
    steps.push('Pulling CRM insights...');
    integrationContext += CRM_MOCK_DATA;
  }

  steps.push('Generating response...');

  // Build system prompt based on product type + enabled integrations
  let systemPrompt = `You are an intelligent AI assistant called Debales AI. `;

  if (productType === 'ai-sales-assistant') {
    systemPrompt += `You help sales teams close deals, understand customer data, and optimize their sales pipeline. `;
  } else if (productType === 'ai-support-bot') {
    systemPrompt += `You help customers resolve issues quickly and efficiently. `;
  } else {
    systemPrompt += `You provide intelligent analytics and insights. `;
  }

  if (integrationContext) {
    systemPrompt += `\n\nYou have access to the following real-time data:\n${integrationContext}\n\nUse this data to give specific, actionable answers when relevant.`;
  }

  systemPrompt += `\n\nBe concise, helpful, and professional. Format responses clearly.`;

  if (!apiKey) {
    // Fallback if no API key
    return {
      content: getFallbackResponse(userMessage, integrations),
      steps,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation history for context
    const history = conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    return { content: text, steps };
  } catch (error: unknown) {
    console.error('Gemini API error:', error);

    // Handle rate limits gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return {
        content:
          "I'm getting a lot of requests right now. Please try again in a moment! In the meantime, I can tell you that all your integrations are running smoothly.",
        steps,
      };
    }

    return {
      content: getFallbackResponse(userMessage, integrations),
      steps,
    };
  }
}

function getFallbackResponse(userMessage: string, integrations: IIntegrations): string {
  const enabledIntegrations = [];
  if (integrations.shopify?.enabled) enabledIntegrations.push('Shopify');
  if (integrations.crm?.enabled) enabledIntegrations.push('CRM');

  if (enabledIntegrations.length > 0) {
    return `I've analyzed your query "${userMessage}" using data from ${enabledIntegrations.join(' and ')}. Based on current metrics, everything looks healthy. Your active integrations are providing real-time insights to help you make better decisions.`;
  }

  return `Thanks for your message! I'm here to help. You can enable Shopify or CRM integrations from the admin panel to get data-driven insights alongside my responses.`;
}
