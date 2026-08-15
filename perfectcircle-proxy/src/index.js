const SYSTEM_PROMPT = `
You judge how close a hand-drawn shape is to a perfect circle.
You will be shown an image with a single drawn stroke on a dark background.
Score strictly on geometric circularity: consistent radius from an implied center, smooth roundness, closed loop. Ignore size, position, and stroke colour.
Respond with ONLY a JSON object, no markdown fences, no extra text, in this exact shape:
{"score": <integer 0-100>, "verdict": "<2-4 word verdict, e.g. 'Suspiciously precise' or 'More egg than circle'>", "feedback": "<one or two sentences of specific, slightly playful critique>"}`;

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
					{ status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
				);
			}

			const orResponse = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${env.HACKCLUB_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "qwen/qwen3-vl-235b-a22b-instruct",
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
				console.error("HackClub API error:", errText);
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

			return new Response(JSON.stringify(parsed), {
				headers: {...corsHeaders, "Content-Type": "application/json" }
			})
		}
		catch (error) {
			console.error(error)
			return new Response(JSON.stringify({error: "Something went wrong"}), {
				status: 500,
				headers: {...corsHeaders, "Content-Type": "application/json" }
			})
		}

	},
};
