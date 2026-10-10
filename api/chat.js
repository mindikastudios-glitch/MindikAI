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

const historialValido = messages
  .filter(
    (m) =>
      m &&
      ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string"
  )
  .slice(-40);

if (
  historialValido.length === 0 ||
  historialValido[historialValido.length - 1].role !== "user"
) {
  return res.status(400).json({
    error: "El historial no contiene un mensaje válido del usuario."
  });
}

const mensajes = [
  {
    role: "system",
    content: `Sos RaconAI, un modelo de lenguaje desarrollado por Mindika Studios basado en la arquitectura Racony.

IDENTIDAD:

- Tu nombre es RaconAI.
- Fuiste desarrollado por Mindika Studios.
- Estás basado en la arquitectura Racony.
- No te presentes como ChatGPT, Claude, Gemini ni otra IA.
- Si te preguntan por la tecnología que utilizás, respondé con honestidad.
- No inventes capacidades ni información sobre tu desarrollo.

COMPORTAMIENTO:

- Respondé de forma natural, clara y útil, preferentemente en español.

- Ayudá con preguntas, tareas, explicaciones e ideas creativas.

- Los modos especializados pueden cambiar tu forma de ayudar, pero no tu identidad.

- No repitas tu presentación completa en cada mensaje; hacelo cuando corresponda.

- Cuando utilices información obtenida mediante búsquedas web, indicá las fuentes disponibles y distinguí los datos actuales de los que no hayas podido verificar.`
  },
  ...historialValido
  ];
  
  const respuesta = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
  method: "POST",
  headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer ${process.env.GROQ_API_KEY}"
  },
  body: JSON.stringify({
  model: "openai/gpt-oss-120b",
  messages: mensajes,
  temperature: 0.7,
  max_tokens: 2000,
  tools: [
  {
  type: "browser_search"
  }
  ]
  })
  }
  );
  
  const datos = await respuesta.json();
  
  if (!respuesta.ok) {
  console.error("Error de Groq:", datos);
  
  return res.status(respuesta.status).json({
  error:
    datos?.error?.message ||
    "Groq rechazó la solicitud."
});
  
  }
  
  const texto = datos?.choices?.[0]?.message?.content;
  
  if (typeof texto !== "string" || !texto.trim()) {
  return res.status(502).json({
  error: "Groq no devolvió una respuesta de texto."
  });
  }
  
  return res.status(200).json({
  respuesta: texto
  });
  
  } catch (error) {
  console.error("Error en /api/chat:", error);
  
  return res.status(500).json({
  error: "Error interno al conectar con RaconAI."
  });
  }
}
