const MODEL = 'google/gemma-4-31b-it:free';

const SYSTEM_PROMPT = ``

export default {
	async fetch(request, env) {
		
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		}

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
		}

		try {
			const { image } = await request.json();
			if(!image) {
				return new Response(JSON.stringify({ error: "Missing image"}), 
					{ headers: { "Content-Type": "application/json", ...corsHeaders } }
				);
			}

			const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: MODEL,
					messages: [
						{ role: "system", content: SYSTEM_PROMPT },
						{
							role: "user",
							content: [
								{ type: "text", text: "Judge this circle." },
								{ type: "image_url", image_url: { url: 'data:image/png;base64,' + image }}
							]
						}
					],
					temperature: 0.7,
					max_tokens: 300,
				})
			})

			if (!orResponse.ok) {
				const errText = await orResponse.text();
				console.error("OpenRouter API error:", errText);
				return new Response(JSON.stringify({ error: "Upstream model error"}), {
					status: 502,
					headers: {...corsHeaders, "Content-Type": "application/json" }
				})
			}

			const data = await orResponse.json();
			const raw = data.choices?.[0]?.message?.content ?? "";
			const cleaned = raw.replace(/```json|```/g, "").trim();
			
			let parsed;
			try {
				parsed = JSON.parse(cleaned);
			} catch {
				console.error("Failed to parse model response:", raw)
				return new Response(JSON.stringify({ error: "Judge gave a non-JSON response"}), {
					status: 502,
					headers: {...corsHeaders, "Content-Type": "application/json" }
				})
			}
				})
			}
		}
		catch (error) {
			
		}

	},
};
