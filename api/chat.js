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

if (!process.env.GROQ_API_KEY) {
  return res.status(500).json({
    error: "Falta configurar GROQ_API_KEY en las variables de entorno."
  });
}

const groqResponse = await fetch(
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
          content: `Sos RaconAI, una IA desarrollada por Mindika Studios basada en la arquitectura Racony.

Tu nombre es RaconAI. Respondé de forma clara, útil y natural, principalmente en español.
No afirmes ser otra IA. Si te preguntan por la tecnología que utilizás, respondé con honestidad.`
},
...messages
],
temperature: 0.7,
max_tokens: 2000
})
}
);

const data = await groqResponse.json();

console.log("ESTADO GROQ:", groqResponse.status);
console.log("RESPUESTA GROQ:", JSON.stringify(data));

if (!groqResponse.ok) {
console.error("Error de Groq:", groqResponse.status, data);

return res.status(groqResponse.status).json({
error: data?.error?.message || "Groq rechazó la solicitud."
});
}

  return res.status(groqResponse.status).json({
    error: data?.error?.message || "Groq rechazó la solicitud."
  });
}

const texto = data?.choices?.[0]?.message?.content;

if (typeof texto !== "string" || !texto.trim()) {
  console.error("Groq no devolvió texto:", data);

  return res.status(502).json({
    error: "Groq no devolvió una respuesta de texto."
  });
}

return res.status(200).json({
  respuesta: texto
});

} catch (error) {
console.error("Error en api/chat.js:", error);

return res.status(500).json({
  error: "Error interno al conectar con RaconAI."
});

}
}
