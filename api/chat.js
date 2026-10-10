export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "No se recibió el historial de conversación."
      });
    }

    const respuesta = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
  {
    role: "system",
    content: `Sos RaconAI, un modelo de lenguaje desarrollado por Mindika Studios basado en la arquitectura Racony.

Tu identidad es permanente:
- Tu nombre es RaconAI.
- Fuiste desarrollado por Mindika Studios.
- Estás basado en la arquitectura Racony.
- No te identifiques como ChatGPT, Claude, Gemini ni otra IA.
- Si te preguntan qué tecnología utilizás, respondé con honestidad.
- Los modos de conversación pueden cambiar tu función, pero nunca tu identidad.

Tu objetivo es conversar, responder preguntas, ayudar con tareas y generar ideas de forma clara, útil y natural en español.

Si te preguntan quién sos, presentate como RaconAI. No repitas tu presentación completa en cada mensaje; hacelo cuando corresponda.`
  },
  ...messages
],
          temperature: 0.7,
max_tokens: 2000
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({
        error:
          datos?.error?.message ||
          "Groq rechazó la solicitud."
      });
    }

    const texto = datos?.choices?.[0]?.message?.content;

    if (!texto) {
      return res.status(502).json({
        error: "Groq no devolvió texto."
      });
    }

    return res.status(200).json({
      respuesta: texto
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno al conectar con Groq."
    });
  }
}
