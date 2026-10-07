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
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
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
