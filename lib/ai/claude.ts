/**
 * Wrapper Claude API para ArriendoSeguro
 * 
 * claude-sonnet-4-6: generación de contratos (complejo, costoso)
 * claude-haiku-4-5: chatbot legal (rápido, económico)
 * 
 * TODO(env): ANTHROPIC_API_KEY — API key de Anthropic
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Tracking de costos (aproximado)
let totalInputTokens = 0;
let totalOutputTokens = 0;

export interface MensajeClaude {
  role: "user" | "assistant";
  content: string;
}

export interface RespuestaClaude {
  contenido: string;
  inputTokens: number;
  outputTokens: number;
  modelo: string;
}

/**
 * Llama a la API de Claude con reintentos automáticos
 */
async function llamarClaude(
  modelo: string,
  mensajes: MensajeClaude[],
  systemPrompt: string,
  maxTokens = 4096
): Promise<RespuestaClaude> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Stub si no hay credencial
  if (!apiKey || apiKey.startsWith("placeholder")) {
    console.warn(
      "[Claude] ANTHROPIC_API_KEY no configurada. Retornando stub.\n" +
      "TODO(env): ANTHROPIC_API_KEY"
    );
    return {
      contenido: "[STUB] Respuesta de prueba — configura ANTHROPIC_API_KEY en .env.local",
      inputTokens: 0,
      outputTokens: 0,
      modelo,
    };
  }

  let ultimoError: Error | null = null;

  for (let intento = 0; intento < MAX_RETRIES; intento++) {
    try {
      const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: modelo,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: mensajes,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Claude API error ${res.status}: ${errorBody}`);
      }

      // @ts-expect-error: Anthropic API response no tiene tipos oficiales instalados
      const data = await res.json();

      const contenido = data.content?.[0]?.text ?? "";
      const inputTokens = data.usage?.input_tokens ?? 0;
      const outputTokens = data.usage?.output_tokens ?? 0;

      // Tracking de costos
      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;

      return { contenido, inputTokens, outputTokens, modelo };
    } catch (err) {
      ultimoError = err instanceof Error ? err : new Error(String(err));

      if (intento < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (intento + 1)));
      }
    }
  }

  throw ultimoError ?? new Error("Error desconocido al llamar a Claude");
}

/**
 * Genera o mejora un contrato de arriendo con claude-sonnet-4-6
 */
export async function generarContrato(datos: {
  arrendador: string;
  arrendatario: string;
  propiedad: string;
  monto: string;
  moneda: "CLP" | "UF";
  fechaInicio: string;
  tipo: string;
  garantiaMeses: number;
  clausulasOpcionales: string[];
}): Promise<string> {
  const system = `Eres un asistente legal especializado en derecho de arrendamiento chileno.
Tu rol es generar contratos de arriendo que cumplan estrictamente con:
- Ley 18.101 de Arrendamiento de Predios Urbanos
- Ley 21.461 (garantía máxima 2 meses)
- Ley 19.799 de firma electrónica
NO inventes derecho. Usa solo las plantillas y marcos legales establecidos.
Responde siempre en español de Chile.`;

  const prompt = `Genera el texto de un contrato de arriendo con estos datos:
- Arrendador: ${datos.arrendador}
- Arrendatario: ${datos.arrendatario}
- Propiedad: ${datos.propiedad}
- Monto: ${datos.monto} ${datos.moneda}
- Fecha inicio: ${datos.fechaInicio}
- Tipo de contrato: ${datos.tipo}
- Garantía: ${datos.garantiaMeses} mes(es) (máx. 2 según Ley 21.461)
- Cláusulas opcionales: ${datos.clausulasOpcionales.join(", ") || "ninguna"}

Genera el contrato completo y legalmente válido. Incluye todas las cláusulas obligatorias según la Ley 18.101.`;

  const respuesta = await llamarClaude(
    "claude-sonnet-4-6",
    [{ role: "user", content: prompt }],
    system,
    8192
  );

  return respuesta.contenido;
}

/**
 * Chatbot legal con claude-haiku-4-5
 * Más rápido y económico para consultas frecuentes
 */
export async function consultarChatbotLegal(
  pregunta: string,
  historial: MensajeClaude[] = []
): Promise<string> {
  const system = `Eres ArriendoBot, el asistente legal de ArriendoSeguro.
Respondes preguntas sobre arrendamiento en Chile de forma clara y en lenguaje simple.
Leyes que conoces: Ley 18.101, Ley 21.461, Ley 19.628, Ley 21.719.
SIEMPRE incluye el siguiente aviso al final: "⚠️ Esta información es orientativa y no constituye asesoría legal formal."
Responde en español de Chile. Sé conciso pero completo.`;

  const mensajes: MensajeClaude[] = [
    ...historial.slice(-6), // últimas 6 interacciones para contexto
    { role: "user", content: pregunta },
  ];

  const respuesta = await llamarClaude(
    "claude-haiku-4-5",
    mensajes,
    system,
    1024
  );

  return respuesta.contenido;
}

/**
 * Retorna estadísticas de uso de tokens (para cost tracking)
 */
export function obtenerEstadisticasUso() {
  return {
    totalInputTokens,
    totalOutputTokens,
    // Costo aproximado en USD (precios Anthropic a mayo 2025)
    costoAproximadoUSD: (totalInputTokens * 0.000003) + (totalOutputTokens * 0.000015),
  };
}
